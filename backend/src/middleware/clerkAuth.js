
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");
const { User } = require("../models");
const logger = require("../config/logger");

let requireAuth;

if (!process.env.CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY.includes("placeholder")) {
  logger.error("CLERK_SECRET_KEY is missing or unconfigured! Auth-protected routes will return 500.");
  requireAuth = (req, res, next) => {
    res.status(500).json({
      error: "Clerk Authentication is unconfigured. Please set CLERK_SECRET_KEY in backend/.env",
    });
  };
} else {
  try {
    requireAuth = ClerkExpressRequireAuth();
  } catch (error) {
    logger.error("Failed to initialize ClerkExpressRequireAuth:", error);
    requireAuth = (req, res, next) => {
      res.status(500).json({
        error: "Failed to initialize Clerk authentication. Check your configuration.",
      });
    };
  }
}

const attachUser = async (req, res, next) => {
  try {
    const clerkId = req.auth.userId;
    let user = await User.findOne({ where: { clerkId } });
    if (!user) {
      user = await User.create({
        clerkId,
        email: req.auth.sessionClaims?.email || "",
        firstName: req.auth.sessionClaims?.first_name || "",
        lastName: req.auth.sessionClaims?.last_name || "",
      });
    }
    await user.update({ lastLogin: new Date() });
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Authentication failed" });
  }
};

module.exports = { requireAuth, attachUser };
