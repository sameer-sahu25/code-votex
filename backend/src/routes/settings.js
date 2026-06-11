
const express = require("express");
const router = express.Router();
const { Settings } = require("../models");
const { requireAuth, attachUser } = require("../middleware/clerkAuth");

router.use(requireAuth, attachUser);

router.get("/", async (req, res, next) => {
  try {
    let settings = await Settings.findOne({
      where: { userId: req.user.id },
    });
    if (!settings) {
      settings = await Settings.create({
        userId: req.user.id,
      });
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.put("/", async (req, res, next) => {
  try {
    let settings = await Settings.findOne({
      where: { userId: req.user.id },
    });
    if (!settings) {
      settings = await Settings.create({
        userId: req.user.id,
        ...req.body,
      });
    } else {
      settings = await settings.update(req.body);
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.post("/reset", async (req, res, next) => {
  try {
    let settings = await Settings.findOne({
      where: { userId: req.user.id },
    });
    
    const defaults = {
      watchDirectories: [],
      entropyThreshold: 7.0,
      threatScoreThreshold: 80,
      filesPerMinThreshold: 200,
      autoKillSwitch: true,
      emailAlerts: false,
      alertEmail: null,
      canaryFilesPerDir: 5,
      autoStartMonitoring: false,
    };

    if (settings) {
      settings = await settings.update(defaults);
    } else {
      settings = await Settings.create({
        userId: req.user.id,
        ...defaults,
      });
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
