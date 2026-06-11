const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const agentRoutes = require('./agent.routes');
const canaryRoutes = require('./canary.routes');
const entropyRoutes = require('./entropy.routes');
const processRoutes = require('./process.routes');
const threatRoutes = require('./threat.routes');
const killswitchRoutes = require('./killswitch.routes');
const analyticsRoutes = require('./analytics.routes');
const healthRoutes = require('./health.routes');
const settingsRoutes = require('./settings');
const alertsRoutes = require('./alerts');

router.use('/auth', authRoutes);
router.use('/agents', agentRoutes);
router.use('/canary', canaryRoutes);
router.use('/entropy', entropyRoutes);
router.use('/process', processRoutes);
router.use('/threat', threatRoutes);
router.use('/killswitch', killswitchRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/health', healthRoutes);
router.use('/settings', settingsRoutes);
router.use('/alerts', alertsRoutes);

module.exports = router;
