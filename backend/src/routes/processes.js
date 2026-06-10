
const express = require("express");
const router = express.Router();
const { Process, MonitoringSession } = require("../models");
const { requireAuth, attachUser } = require("../middleware/clerkAuth");
const mlAuth = require("../middleware/mlAuth");

router.get("/", requireAuth, attachUser, async (req, res, next) => {
  try {
    const { status, sortBy = "threatScore", page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const session = await MonitoringSession.findOne({
      where: { userId: req.user.id, status: "active" },
    });
    if (!session) {
      return res.json({ processes: [], total: 0, page, limit });
    }
    const where = { sessionId: session.id };
    if (status) where.status = status;
    const order = [[sortBy, "DESC"]];
    const { count, rows: processes } = await Process.findAndCountAll({
      where,
      limit,
      offset,
      order,
    });
    res.json({ processes, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    next(error);
  }
});

router.post("/", mlAuth, async (req, res, next) => {
  try {
    const { sessionId, pid, ...data } = req.body;
    const [process] = await Process.findOrCreate({
      where: { sessionId, pid },
      defaults: { sessionId, pid, ...data },
    });
    const updatedProcess = await process.update(data);
    if (data.threatScore !== undefined) {
      const io = req.app.get("io");
      io.to(`session:${sessionId}`).emit("threatScore", {
        processId: process.id,
        threatScore: data.threatScore,
      });
    }
    res.json(updatedProcess);
  } catch (error) {
    next(error);
  }
});

router.get("/:pid", requireAuth, attachUser, async (req, res, next) => {
  try {
    const session = await MonitoringSession.findOne({
      where: { userId: req.user.id, status: "active" },
    });
    if (!session) {
      return res.status(404).json({ error: "No active session" });
    }
    const process = await Process.findOne({
      where: { sessionId: session.id, pid: req.params.pid },
    });
    if (!process) {
      return res.status(404).json({ error: "Process not found" });
    }
    res.json(process);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
