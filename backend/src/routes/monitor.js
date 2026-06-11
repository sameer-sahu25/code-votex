
const express = require("express");
const router = express.Router();
const { MonitoringSession, Alert } = require("../models");
const { validate, schemas } = require("../middleware/validate");
const { redis, KEYS, EXPIRY } = require("../config/redis");
const { requireAuth, attachUser } = require("../middleware/clerkAuth");
const axios = require("axios");
const logger = require("../config/logger");

// Secure monitor endpoints with Clerk Auth middleware
router.use(requireAuth, attachUser);

router.get("/status", async (req, res, next) => {
  try {
    const cacheKey = KEYS.MONITORING_SESSION(req.user.id);
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    const session = await MonitoringSession.findOne({
      where: { userId: req.user.id, status: "active" },
    });
    if (session) {
      await redis.set(cacheKey, JSON.stringify(session), "EX", EXPIRY.MONITORING_SESSION);
    }
    res.json(session || null);
  } catch (error) {
    next(error);
  }
});

router.post("/start", validate(schemas.startMonitor), async (req, res, next) => {
  try {
    const { directories } = req.body;
    const session = await MonitoringSession.create({
      userId: req.user.id,
      status: "active",
      watchDirectories: directories,
    });
    const cacheKey = KEYS.MONITORING_SESSION(req.user.id);
    await redis.set(cacheKey, JSON.stringify(session), "EX", EXPIRY.MONITORING_SESSION);
    try {
      await axios.post(
        `${process.env.ML_SERVICE_URL}/start`,
        { directories, sessionId: session.id },
        { headers: { "x-api-key": process.env.ML_API_KEY } }
      );
    } catch (e) {
      logger.error("Failed to call ML service:", e.message);
    }
    const io = req.app.get("io");
    io.emit("monitoringStarted", { session });
    res.json(session);
  } catch (error) {
    next(error);
  }
});

router.post("/stop", async (req, res, next) => {
  try {
    const session = await MonitoringSession.findOne({
      where: { userId: req.user.id, status: "active" },
    });
    if (!session) {
      return res.status(404).json({ error: "No active session found" });
    }
    const updatedSession = await session.update({
      status: "stopped",
      endedAt: new Date(),
    });
    const cacheKey = KEYS.MONITORING_SESSION(req.user.id);
    await redis.del(cacheKey);
    try {
      await axios.post(
        `${process.env.ML_SERVICE_URL}/stop`,
        {},
        { headers: { "x-api-key": process.env.ML_API_KEY } }
      );
    } catch (e) {
      logger.error("Failed to call ML service:", e.message);
    }
    const io = req.app.get("io");
    io.emit("monitoringStopped", { session: updatedSession });
    res.json(updatedSession);
  } catch (error) {
    next(error);
  }
});

router.get("/history", async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const { count, rows: sessions } = await MonitoringSession.findAndCountAll({
      where: { userId: req.user.id },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [{ model: Alert, attributes: ["id"] }],
    });
    const sessionsWithCounts = sessions.map(session => ({
      ...session.toJSON(),
      alertCount: session.Alerts.length,
    }));
    res.json({ sessions: sessionsWithCounts, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
