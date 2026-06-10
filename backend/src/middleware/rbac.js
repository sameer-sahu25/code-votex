const { error } = require('../utils/response');

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Unauthorized', 401);
    }

    if (!roles.includes(req.user.role)) {
      return error(res, 'Forbidden - Insufficient permissions', 403);
    }

    next();
  };
};

module.exports = { requireRole };
