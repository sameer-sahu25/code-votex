const { startThreatEvaluator } = require('./threatEvaluator.job');
const { startCleanupJob } = require('./cleanup.job');

const startJobs = () => {
  startThreatEvaluator();
  startCleanupJob();
};

module.exports = { startJobs };
