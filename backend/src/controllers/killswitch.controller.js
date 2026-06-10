const killswitchService = require('../services/killswitch.service');
const { success, error } = require('../utils/response');
const logger = require('../config/logger');

const trigger = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return error(res, 'Forbidden', 403);
    }
    const { agentId } = req.params;
    const { reason } = req.body;
    const log = await killswitchService.triggerKillSwitch(agentId, 'manual', req.user.id, null, reason);
    return success(res, {
      logId: log.id,
      action: log.action,
      agentStatus: 'quarantined',
      timestamp: log.executedAt
    }, 200);
  } catch (err) {
    logger.error('Error triggering kill switch:', err);
    if (err.message === 'Agent not found') {
      return error(res, err.message, 404);
    }
    return error(res, 'Internal server error', 500);
  }
};

const restore = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return error(res, 'Forbidden', 403);
    }
    const { agentId } = req.params;
    const { reason } = req.body;
    const log = await killswitchService.restoreAgent(agentId, req.user.id, reason);
    return success(res, {
      logId: log.id,
      action: log.action,
      agentStatus: 'online'
    }, 200);
  } catch (err) {
    logger.error('Error restoring agent:', err);
    if (err.message === 'Agent not found') {
      return error(res, err.message, 404);
    }
    return error(res, 'Internal server error', 500);
  }
};

const getLogs = async (req, res) => {
  try {
    const { agentId, triggeredBy, action, startDate, endDate, page = 1, limit = 20 } = req.query;
    const result = await killswitchService.getLogs(
      agentId, triggeredBy, action, startDate, endDate, page, limit
    );
    return success(res, result.items, 200, {
      page: Number(page),
      limit: Number(limit),
      total: result.total
    });
  } catch (err) {
    console.error('Error getting killswitch logs:', err);
    return error(res, 'Internal server error', 500);
  }
};

const getLogById = async (req, res) => {
  try {
    const log = await killswitchService.getLogById(req.params.id);
    if (!log) {
      return error(res, 'Kill switch log not found', 404);
    }
    return success(res, log, 200);
  } catch (err) {
    console.error('Error getting killswitch log:', err);
    return error(res, 'Internal server error', 500);
  }
};

const agentConfirm = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { commandOutput, success: eventSuccess, errorMessage } = req.body;
    const log = await killswitchService.agentConfirm(agentId, commandOutput, eventSuccess, errorMessage);
    return success(res, log, 200);
  } catch (err) {
    console.error('Error confirming killswitch:', err);
    if (err.message === 'No kill switch log found') {
      return error(res, err.message, 404);
    }
    return error(res, 'Internal server error', 500);
  }
};

module.exports = {
  trigger,
  restore,
  getLogs,
  getLogById,
  agentConfirm
};
