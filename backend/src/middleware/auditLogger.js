const { AuditLog } = require('../models');
const logger = require('../config/logger');

const auditLogger = (action, entity) => {
  return async (req, res, next) => {
    const oldOnEnd = res.end;

    res.end = async function (...args) {
      try {
        if (res.statusCode < 400) {
          await AuditLog.create({
            userId: req.user?.id,
            agentId: req.params.agentId,
            action,
            entity,
            entityId: req.params.id || req.params.agentId,
            oldValues: null,
            newValues: null,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
          });
        }
      } catch (err) {
        logger.error('Audit log error:', err);
      }
      oldOnEnd.apply(this, args);
    };

    next();
  };
};

module.exports = { auditLogger };
