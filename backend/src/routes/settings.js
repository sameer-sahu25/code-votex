
const express = require("express");
const router = express.Router();
const { Settings } = require("../models");
const { validate, schemas } = require("../middleware/validate");

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

router.put("/", validate(schemas.updateSettings), async (req, res, next) => {
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

module.exports = router;
