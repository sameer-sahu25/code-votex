
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");
const { FileEvent, MonitoringSession } = require("../models");
const { requireAuth, attachUser } = require("../middleware/clerkAuth");
const mlAuth = require("../middleware/mlAuth");

router.get("/events", requireAuth, attachUser, async (req, res, next) => {
  try {
    const { sessionId, page = 1, limit = 50, eventType } = req.query;
    const offset = (page - 1) * limit;
    const session = sessionId
      ? await MonitoringSession.findByPk(sessionId)
      : await MonitoringSession.findOne({
          where: { userId: req.user.id, status: "active" },
        });
    if (!session) {
      return res.json({ events: [], total: 0, page, limit });
    }
    const where = { sessionId: session.id };
    if (eventType) where.eventType = eventType;
    const { count, rows: events } = await FileEvent.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
    res.json({ events, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    next(error);
  }
});

router.post("/events", mlAuth, async (req, res, next) => {
  try {
    const event = await FileEvent.create(req.body);
    const io = req.app.get("io");
    io.to(`session:${req.body.sessionId}`).emit("fileEvent", event);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});

router.get("/stats", requireAuth, attachUser, async (req, res, next) => {
  try {
    const session = await MonitoringSession.findOne({
      where: { userId: req.user.id, status: "active" },
    });
    if (!session) {
      return res.json({ total: 0, highEntropy: 0, eventsByType: {}, activeDirs: [] });
    }
    const total = await FileEvent.count({ where: { sessionId: session.id } });
    const highEntropy = await FileEvent.count({
      where: {
        sessionId: session.id,
        [Op.or]: [
          { entropyAfter: { [Op.gte]: 7 } },
          { entropyBefore: { [Op.gte]: 7 } },
        ],
      },
    });
    const eventsByType = await FileEvent.findAll({
      where: { sessionId: session.id },
      attributes: [
        "eventType",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["eventType"],
      raw: true,
    });
    const typeCounts = {};
    eventsByType.forEach(e => {
      typeCounts[e.eventType] = parseInt(e.count);
    });
    res.json({
      total,
      highEntropy,
      eventsByType: typeCounts,
      activeDirs: [],
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
