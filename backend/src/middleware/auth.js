const { verifyAccessToken } = require('../utils/jwt');
const { error } = require('../utils/response');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Unauthorized - No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['passwordHash', 'refreshToken'] },
    });

    if (!user || !user.isActive) {
      return error(res, 'Unauthorized - Invalid or expired token', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    return error(res, 'Unauthorized - Invalid token', 401);
  }
};

module.exports = { auth };
