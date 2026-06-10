
const express = require("express");
const router = express.Router();
const { CanaryFile, MonitoringSession, Alert } = require("../models");
const { requireAuth, attachUser } = require("../middleware/clerkAuth");
const mlAuth = require("../middleware/mlAuth");

router.get("/", requireAuth, attachUser, async (req, res, next) => {
  try {
    const session = await MonitoringSession.findOne({
      where: { userId: req.user.id, status: "active" },
    });
    if (!session) {
      return res.json([]);
    }
    const canaryFiles = await CanaryFile.findAll({
      where: { sessionId: session.id },
      order: [["createdAt", "DESC"]],
    });
    res.json(canaryFiles);
  } catch (error) {
    next(error);
  }
});

router.post("/", mlAuth, async (req, res, next) => {
  try {
    const { sessionId, files } = req.body;
    const canaryFiles = await CanaryFile.bulkCreate(
      files.map(file => ({
        sessionId,
        filePath: file.path,
        fileName: file.name,
        directory: file.dir,
        status: "safe",
      }))
    );
    res.status(201).json(canaryFiles);
  } catch (error) {
    next(error);
  }
});

router.post("/alert", mlAuth, async (req, res, next) => {
  try {
    const { sessionId, filePath, processName, processPid } = req.body;
    const canaryFile = await CanaryFile.findOne({
      where: { sessionId, filePath },
    });
    if (!canaryFile) {
      return res.status(404).json({ error: "Canary file not found" });
    }
    const updatedFile = await canaryFile.update({
      status: "touched",
      touchedBy: processName,
      touchedByPid: processPid,
      touchedAt: new Date(),
    });
    const session = await MonitoringSession.findByPk(sessionId);
    const alert = await Alert.create({
      sessionId,
      userId: session.userId,
      type: "critical",
      message: "Canary file touched! Possible ransomware detected.",
      processName,
      processPid,
      filePath,
      isCanaryAlert: true,
    });
    const io = req.app.get("io");
    io.to(`session:${sessionId}`).emit("canaryTouched", updatedFile);
    io.to(`session:${sessionId}`).emit("alert", alert);
    io.to(`session:${sessionId}`).emit("criticalAlert", alert);
    res.json(updatedFile);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
