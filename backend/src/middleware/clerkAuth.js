
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");
const { User } = require("../models");

const requireAuth = ClerkExpressRequireAuth();

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
