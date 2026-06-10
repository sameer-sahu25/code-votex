const { EntropyEvent, ProcessEvent, ThreatScore } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

const runCleanup = async () => {
  try {
    const eventCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const threatScoreCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const [entropyDeleted, processDeleted, threatDeleted] = await Promise.all([
      EntropyEvent.destroy({ 
        where: { 
          sampledAt: { [Op.lt]: eventCutoff },
          isAnomaly: false
        } 
      }),
      ProcessEvent.destroy({ 
        where: { 
          observedAt: { [Op.lt]: eventCutoff },
          isSuspicious: false
        } 
      }),
      ThreatScore.destroy({ 
        where: { 
          calculatedAt: { [Op.lt]: threatScoreCutoff }
        } 
      }),
    ]);

    logger.info(`Cleanup job completed: deleted ${entropyDeleted} entropy events, ${processDeleted} process events, ${threatDeleted} threat scores`);
  } catch (err) {
    logger.error('Error running cleanup job:', err);
  }
};

const startCleanupJob = () => {
  setInterval(runCleanup, 86400000);
  logger.info('Cleanup job started');
};

module.exports = { startCleanupJob, runCleanup };
