const canaryService = require('../services/canary.service');
const threatScoreService = require('../services/threatScore.service');
const alertService = require('../services/alert.service');
const { success, error } = require('../utils/response');
const logger = require('../config/logger');

const registerCanaryFile = async (req, res) => {
  try {
    const { filePath, fileName, fileHash } = req.body;
    const canaryFile = await canaryService.registerCanaryFile(req.agent.id, filePath, fileName, fileHash);
    return success(res, canaryFile, 201);
  } catch (err) {
    logger.error('Error registering canary file:', err);
    return error(res, err.message, 400);
  }
};

const getCanaryFiles = async (req, res) => {
  try {
    const { agentId, isTriggered, page, limit } = req.query;
    const result = await canaryService.getCanaryFiles(agentId, isTriggered ? isTriggered === 'true' : undefined, page, limit);
    return success(res, result.items, 200, { page, limit, total: result.total });
  } catch (err) {
    logger.error('Error getting canary files:', err);
    return error(res, err.message, 500);
  }
};

const getCanaryFileById = async (req, res) => {
  try {
    const canaryFile = await canaryService.getCanaryFileById(req.params.id);
    if (!canaryFile) {
      return error(res, 'Canary file not found', 404);
    }
    return success(res, canaryFile, 200);
  } catch (err) {
    logger.error('Error getting canary file by ID:', err);
    return error(res, err.message, 500);
  }
};

const createCanaryAlert = async (req, res) => {
  try {
    const { canaryFileId, processName, processPid, accessType, rawEventData } = req.body;
    const alert = await canaryService.createCanaryAlert(canaryFileId, req.agent.id, processName, processPid, accessType, rawEventData);
    const threatScore = await threatScoreService.calculateThreatScore(req.agent.id);
    alertService.emitCanaryAlert(req.agent.id, alert);
    alertService.emitThreatScoreUpdate(req.agent.id, threatScore);
    return success(res, { alertId: alert.id, currentThreatScore: threatScore.score }, 201);
  } catch (err) {
    logger.error('Error creating canary alert:', err);
    return error(res, err.message, 400);
  }
};

const getCanaryAlerts = async (req, res) => {
  try {
    const { agentId, severity, isAcknowledged, startDate, endDate, page, limit } = req.query;
    const result = await canaryService.getCanaryAlerts(
      agentId,
      severity,
      isAcknowledged ? isAcknowledged === 'true' : undefined,
      startDate,
      endDate,
      page,
      limit
    );
    return success(res, result.items, 200, { page, limit, total: result.total });
  } catch (err) {
    logger.error('Error getting canary alerts:', err);
    return error(res, err.message, 500);
  }
};

const getCanaryAlertById = async (req, res) => {
  try {
    const alert = await canaryService.getCanaryAlertById(req.params.id);
    if (!alert) {
      return error(res, 'Canary alert not found', 404);
    }
    return success(res, alert, 200);
  } catch (err) {
    logger.error('Error getting canary alert by ID:', err);
    return error(res, err.message, 500);
  }
};

const acknowledgeAlert = async (req, res) => {
  try {
    const alert = await canaryService.acknowledgeAlert(req.params.id, req.user.id);
    return success(res, alert, 200);
  } catch (err) {
    logger.error('Error acknowledging alert:', err);
    return error(res, err.message, 500);
  }
};

const bulkAcknowledge = async (req, res) => {
  try {
    await canaryService.bulkAcknowledge(req.body.alertIds, req.user.id);
    return success(res, null, 200);
  } catch (err) {
    logger.error('Error bulk acknowledging alerts:', err);
    return error(res, err.message, 500);
  }
};

const deleteCanaryFile = async (req, res) => {
  try {
    await canaryService.deleteCanaryFile(req.params.id);
    return success(res, null, 200);
  } catch (err) {
    logger.error('Error deleting canary file:', err);
    return error(res, err.message, 500);
  }
};

module.exports = {
  registerCanaryFile,
  getCanaryFiles,
  getCanaryFileById,
  createCanaryAlert,
  getCanaryAlerts,
  getCanaryAlertById,
  acknowledgeAlert,
  bulkAcknowledge,
  deleteCanaryFile,
};
