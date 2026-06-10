const analyticsService = require('../services/analytics.service');
const { success, error } = require('../utils/response');
const logger = require('../config/logger');

const getOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const overview = await analyticsService.getOverview(startDate, endDate);
    return success(res, overview, 200);
  } catch (err) {
    logger.error('Error getting analytics overview:', err);
    return error(res, 'Internal server error', 500);
  }
};

const getAgentsComparison = async (req, res) => {
  try {
    const comparison = await analyticsService.getAgentsComparison();
    return success(res, comparison, 200);
  } catch (err) {
    logger.error('Error getting agents comparison:', err);
    return error(res, 'Internal server error', 500);
  }
};

const getThreatPatterns = async (req, res) => {
  try {
    const { agentId, days = 7 } = req.query;
    const patterns = await analyticsService.getThreatPatterns(agentId, days);
    return success(res, patterns, 200);
  } catch (err) {
    logger.error('Error getting threat patterns:', err);
    return error(res, 'Internal server error', 500);
  }
};

const exportData = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return error(res, 'Forbidden', 403);
    }
    const { startDate, endDate, format = 'json', types = [] } = req.query;
    const typesArray = Array.isArray(types) ? types : types.split(',');
    const data = await analyticsService.exportData(startDate, endDate, format, typesArray);
    return success(res, data, 200);
  } catch (err) {
    logger.error('Error exporting data:', err);
    return error(res, 'Internal server error', 500);
  }
};

module.exports = {
  getOverview,
  getAgentsComparison,
  getThreatPatterns,
  exportData
};
