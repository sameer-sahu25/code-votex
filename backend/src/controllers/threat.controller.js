const threatScoreService = require('../services/threatScore.service');
const { success, error } = require('../utils/response');
const logger = require('../config/logger');

const getScore = async (req, res) => {
  try {
    const { agentId } = req.params;
    const score = await threatScoreService.getLatestThreatScore(agentId);
    if (!score) {
      return error(res, 'Threat score not found', 404);
    }
    return success(res, score, 200);
  } catch (err) {
    logger.error('Error getting threat score:', err);
    return error(res, 'Internal server error', 500);
  }
};

const getScoreHistory = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { hours = 24, page = 1, limit = 20 } = req.query;
    const result = await threatScoreService.getThreatScores(agentId, hours, page, limit);
    return success(res, result.items, 200, {
      page: Number(page),
      limit: Number(limit),
      total: result.total,
      verdictDistribution: result.distribution
    });
  } catch (err) {
    logger.error('Error getting threat score history:', err);
    return error(res, 'Internal server error', 500);
  }
};

const getScoreTimeline = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { startDate, endDate, interval } = req.query;
    const result = await threatScoreService.getThreatTimeline(agentId, startDate, endDate, interval);
    return success(res, result, 200);
  } catch (err) {
    logger.error('Error getting threat score timeline:', err);
    return error(res, 'Internal server error', 500);
  }
};

const calculateScore = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return error(res, 'Forbidden', 403);
    }
    const { agentId } = req.params;
    const score = await threatScoreService.calculateThreatScore(agentId);
    return success(res, score, 200);
  } catch (err) {
    logger.error('Error calculating threat score:', err);
    return error(res, 'Internal server error', 500);
  }
};

const getDashboard = async (req, res) => {
  try {
    const stats = await threatScoreService.getDashboardStats(req.user.id, req.user.role);
    return success(res, stats, 200);
  } catch (err) {
    logger.error('Error getting dashboard stats:', err);
    return error(res, 'Internal server error', 500);
  }
};

module.exports = {
  getScore,
  getScoreHistory,
  getScoreTimeline,
  calculateScore,
  getDashboard
};
