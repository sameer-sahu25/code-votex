
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many auth attempts" },
});

const mlLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
});

module.exports = { apiLimiter, authLimiter, mlLimiter };
