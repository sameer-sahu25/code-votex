const { Agent } = require('../models');
const threatScoreService = require('../services/threatScore.service');
const logger = require('../config/logger');

const runThreatEvaluator = async () => {
  try {
    const agents = await Agent.findAll({ where: { status: { [require('sequelize').Op.ne]: 'isolated' } } });

    for (const agent of agents) {
      try {
        await threatScoreService.calculateThreatScore(agent.id);
      } catch (err) {
        logger.error(`Error evaluating threat for agent ${agent.id}:`, err);
      }
    }
  } catch (err) {
    logger.error('Error running threat evaluator:', err);
  }
};

const startThreatEvaluator = () => {
  setInterval(runThreatEvaluator, 10000);
  logger.info('Threat evaluator job started');
};

module.exports = { startThreatEvaluator, runThreatEvaluator };
