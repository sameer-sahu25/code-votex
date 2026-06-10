
const express = require("express");
const router = express.Router();
const { requireAuth, attachUser } = require("../middleware/clerkAuth");
const mlAuth = require("../middleware/mlAuth");
const { redis } = require("../config/redis");
const axios = require("axios");

router.get("/status", requireAuth, attachUser, async (req, res, next) => {
  try {
    const status = await redis.get(`network:${req.user.id}`) || "connected";
    res.json({ status });
  } catch (error) {
    next(error);
  }
});

router.post("/isolate", requireAuth, attachUser, async (req, res, next) => {
  try {
    await redis.set(`network:${req.user.id}`, "isolated");
    try {
      await axios.post(
        `${process.env.ML_SERVICE_URL}/network/isolate`,
        {},
        { headers: { "x-api-key": process.env.ML_API_KEY } }
      );
    } catch (e) {
      console.error("Failed to call ML service:", e.message);
    }
    const io = req.app.get("io");
    io.emit("networkStatus", { status: "isolated" });
    res.json({ status: "isolated" });
  } catch (error) {
    next(error);
  }
});

router.post("/restore", requireAuth, attachUser, async (req, res, next) => {
  try {
    await redis.set(`network:${req.user.id}`, "connected");
    try {
      await axios.post(
        `${process.env.ML_SERVICE_URL}/network/restore`,
        {},
        { headers: { "x-api-key": process.env.ML_API_KEY } }
      );
    } catch (e) {
      console.error("Failed to call ML service:", e.message);
    }
    const io = req.app.get("io");
    io.emit("networkStatus", { status: "connected" });
    res.json({ status: "connected" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
