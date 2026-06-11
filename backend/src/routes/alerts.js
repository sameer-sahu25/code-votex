
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");
const { Alert, MonitoringSession } = require("../models");
const { requireAuth, attachUser } = require("../middleware/clerkAuth");
const mlAuth = require("../middleware/mlAuth");
const { redis, KEYS, EXPIRY } = require("../config/redis");

router.get("/", requireAuth, attachUser, async (req, res, next) => {
  try {
    const { type, page = 1, limit = 10, sessionId, search } = req.query;
    const offset = (page - 1) * limit;
    const where = { userId: req.user.id };
    if (type) where.type = type;
    if (sessionId) where.sessionId = sessionId;
    if (search) {
      where[Op.or] = [
        { message: { [Op.like]: `%${search}%` } },
        { processName: { [Op.like]: `%${search}%` } },
      ];
    }
    const cacheKey = `alerts:${req.user.id}:${JSON.stringify(req.query)}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    const { count, rows: alerts } = await Alert.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
    const result = { alerts, total: count, page: parseInt(page), limit: parseInt(limit) };
    await redis.set(cacheKey, JSON.stringify(result), "EX", 5);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/", mlAuth, async (req, res, next) => {
  try {
    const session = await MonitoringSession.findByPk(req.body.sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    const alertData = {
      ...req.body,
      userId: session.userId,
    };
    const alert = await Alert.create(alertData);
    await session.increment("totalAlertsCount");
    const io = req.app.get("io");
    io.to(`session:${req.body.sessionId}`).emit("alert", alert);
    if (req.body.type === "critical") {
      io.to(`session:${req.body.sessionId}`).emit("criticalAlert", alert);
    }
    res.status(201).json(alert);
  } catch (error) {
    next(error);
  }
});

router.put("/:id/acknowledge", requireAuth, attachUser, async (req, res, next) => {
  try {
    const alert = await Alert.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }
    const updatedAlert = await alert.update({
      acknowledged: true,
      acknowledgedAt: new Date(),
    });
    res.json(updatedAlert);
  } catch (error) {
    next(error);
  }
});

router.delete("/clear", requireAuth, attachUser, async (req, res, next) => {
  try {
    await Alert.destroy({ where: { userId: req.user.id } });
    const keys = await redis.keys(`alerts:${req.user.id}:*`);
    if (keys.length) await redis.del(keys);
    res.json({ message: "All alerts cleared" });
  } catch (error) {
    next(error);
  }
});

router.get("/stats", requireAuth, attachUser, async (req, res, next) => {
  try {
    const session = await MonitoringSession.findOne({
      where: { userId: req.user.id, status: "active" },
    });
    const where = session ? { sessionId: session.id } : { userId: req.user.id };
    const counts = await Alert.findAll({
      where,
      attributes: ["type", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      group: ["type"],
      raw: true,
    });
    const lastAlert = await Alert.findOne({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    const stats = {
      total: 0,
      critical: 0,
      warning: 0,
      info: 0,
      lastAlertTime: lastAlert?.createdAt || null,
    };
    counts.forEach(c => {
      stats[c.type] = parseInt(c.count);
      stats.total += parseInt(c.count);
    });
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
