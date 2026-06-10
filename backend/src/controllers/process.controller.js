const processService = require('../services/process.service');
const { success, error } = require('../utils/response');
const logger = require('../config/logger');

const createEvent = async (req, res) => {
  try {
    const processEvent = await processService.createEvent(req.agent.id, req.body);
    return success(res, {
      eventId: processEvent.id,
      isSuspicious: processEvent.isSuspicious,
      suspicionReasons: processEvent.suspicionReasons
    }, 201);
  } catch (err) {
    console.error('Error creating process event:', err);
    return error(res, 'Internal server error', 500);
  }
};

const createBatchEvents = async (req, res) => {
  try {
    const { events } = req.body;
    if (!Array.isArray(events) || events.length > 50) {
      return error(res, 'Events must be an array of up to 50 events', 400);
    }
    const result = await processService.createBatchEvents(req.agent.id, events);
    return success(res, { processed: result.length }, 201);
  } catch (err) {
    console.error('Error creating batch process events:', err);
    return error(res, 'Internal server error', 500);
  }
};

const getEvents = async (req, res) => {
  try {
    const { agentId, isSuspicious, processName, startDate, endDate, page = 1, limit = 20 } = req.query;
    const result = await processService.getEvents(
      agentId, isSuspicious, processName, startDate, endDate, page, limit
    );
    return success(res, result, 200, {
      page: Number(page),
      limit: Number(limit),
      total: result.total
    });
  } catch (err) {
    logger.error('Error getting process events:', err);
    return error(res, 'Internal server error', 500);
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await processService.getEventById(req.params.id);
    if (!event) {
      return error(res, 'Process event not found', 404);
    }
    return success(res, event, 200);
  } catch (err) {
    logger.error('Error getting process event:', err);
    return error(res, 'Internal server error', 500);
  }
};

const getTopThreats = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { hours = 1, limit = 10 } = req.query;
    const result = await processService.getTopThreats(agentId, hours, limit);
    return success(res, result, 200);
  } catch (err) {
    console.error('Error getting top threats:', err);
    return error(res, 'Internal server error', 500);
  }
};

const getStats = async (req, res) => {
  try {
    const { agentId } = req.params;
    const result = await processService.getStats(agentId);
    return success(res, result, 200);
  } catch (err) {
    console.error('Error getting process stats:', err);
    return error(res, 'Internal server error', 500);
  }
};

module.exports = {
  createEvent,
  createBatchEvents,
  getEvents,
  getEventById,
  getTopThreats,
  getStats
};
