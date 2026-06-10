const entropyService = require('../services/entropy.service');
const threatScoreService = require('../services/threatScore.service');
const alertService = require('../services/alert.service');
const { success, error } = require('../utils/response');
const logger = require('../config/logger');

const createEvent = async (req, res) => {
  try {
    const { filePath, fileName, fileExtension, entropyScore, fileSize, previousScore, sampledAt } = req.body;
    const event = await entropyService.createEvent(
      req.agent.id,
      filePath,
      fileName,
      fileExtension,
      entropyScore,
      fileSize,
      previousScore,
      sampledAt
    );

    if (event.isAnomaly) {
      const threatScore = await threatScoreService.calculateThreatScore(req.agent.id);
      alertService.emitEntropyAnomaly(req.agent.id, event);
      alertService.emitThreatScoreUpdate(req.agent.id, threatScore);
    }

    return success(res, { eventId: event.id, isAnomaly: event.isAnomaly, anomalyReason: event.anomalyReason }, 201);
  } catch (err) {
    logger.error('Error creating entropy event:', err);
    return error(res, err.message, 400);
  }
};

const createBatchEvents = async (req, res) => {
  try {
    const eventsWithAgentId = req.body.events.map((e) => ({ ...e, agentId: req.agent.id }));
    const result = await entropyService.createBatchEvents(eventsWithAgentId);
    if (result.anomalies > 0) {
      const threatScore = await threatScoreService.calculateThreatScore(req.agent.id);
      alertService.emitThreatScoreUpdate(req.agent.id, threatScore);
    }
    return success(res, result, 200);
  } catch (err) {
    logger.error('Error creating batch entropy events:', err);
    return error(res, err.message, 400);
  }
};

const getEvents = async (req, res) => {
  try {
    const { agentId, isAnomaly, minScore, maxScore, startDate, endDate, page, limit } = req.query;
    const result = await entropyService.getEvents(
      agentId,
      isAnomaly ? isAnomaly === 'true' : undefined,
      minScore ? parseFloat(minScore) : undefined,
      maxScore ? parseFloat(maxScore) : undefined,
      startDate,
      endDate,
      page,
      limit
    );
    return success(res, result.items, 200, { page, limit, total: result.total });
  } catch (err) {
    logger.error('Error getting entropy events:', err);
    return error(res, err.message, 500);
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await entropyService.getEventById(req.params.id);
    if (!event) {
      return error(res, 'Entropy event not found', 404);
    }
    return success(res, event, 200);
  } catch (err) {
    logger.error('Error getting entropy event by ID:', err);
    return error(res, err.message, 500);
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await entropyService.getStats(req.params.agentId);
    return success(res, stats, 200);
  } catch (err) {
    logger.error('Error getting entropy stats:', err);
    return error(res, err.message, 500);
  }
};

const getHeatmap = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const heatmap = await entropyService.getHeatmap(req.params.agentId, startDate, endDate);
    return success(res, heatmap, 200);
  } catch (err) {
    logger.error('Error getting entropy heatmap:', err);
    return error(res, err.message, 500);
  }
};

module.exports = {
  createEvent,
  createBatchEvents,
  getEvents,
  getEventById,
  getStats,
  getHeatmap,
};
