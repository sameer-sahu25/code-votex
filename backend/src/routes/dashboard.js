
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { MonitoringSession, Alert, FileEvent, Process } = require("../models");
const { redis, KEYS } = require("../config/redis");

router.get("/stats", async (req, res, next) => {
  try {
    const session = await MonitoringSession.findOne({
      where: { userId: req.user.id, status: "active" },
    });
    const [
      filesMonitored,
      activeProcesses,
      alertsToday,
      attacksStopped,
      recentAlerts,
      topProcesses,
    ] = await Promise.all([
      session ? FileEvent.count({ where: { sessionId: session.id } }) : 0,
      session ? Process.count({ where: { sessionId: session.id } }) : 0,
      Alert.count({
        where: {
          userId: req.user.id,
          createdAt: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      MonitoringSession.count({
        where: { userId: req.user.id, attackStopped: true },
      }),
      Alert.findAll({
        where: { userId: req.user.id },
        limit: 5,
        order: [["createdAt", "DESC"]],
      }),
      session
        ? Process.findAll({
            where: { sessionId: session.id },
            limit: 3,
            order: [["threatScore", "DESC"]],
          })
        : [],
    ]);
    const threatScore = await redis.get(KEYS.THREAT_SCORE(session?.id)) || 0;
    const networkStatus = await redis.get(`network:${req.user.id}`) || "connected";
    res.json({
      filesMonitored,
      threatScore: parseInt(threatScore),
      activeProcesses,
      alertsToday,
      attacksStopped,
      networkStatus,
      monitoringStatus: session?.status || "stopped",
      sessionStarted: session?.startedAt || null,
      recentAlerts,
      topProcesses,
      entropyTimeline: [],
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
