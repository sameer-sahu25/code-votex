const express = require('express');
const router = express.Router();

// Existing Agent-based/Custom JWT routes
const authRoutes = require('./auth.routes');
const agentRoutes = require('./agent.routes');
const canaryRoutes = require('./canary.routes');
const entropyRoutes = require('./entropy.routes');
const processRoutes = require('./process.routes');
const threatRoutes = require('./threat.routes');
const killswitchRoutes = require('./killswitch.routes');
const analyticsRoutes = require('./analytics.routes');
const healthRoutes = require('./health.routes');

// Session-based Simulator routes
const settingsRoutes = require('./settings');
const alertsRoutes = require('./alerts');
const dashboardRoutes = require('./dashboard');
const processesRoutes = require('./processes');
const monitorRoutes = require('./monitor');
const filesRoutes = require('./files');
const networkRoutes = require('./network');
const canarySessionRoutes = require('./canary');

// Mount Agent-based routes
router.use('/auth', authRoutes);
router.use('/agents', agentRoutes);
router.use('/canary', canaryRoutes);
router.use('/entropy', entropyRoutes);
router.use('/process', processRoutes);
router.use('/threat', threatRoutes);
router.use('/killswitch', killswitchRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/health', healthRoutes);

// Mount Session-based Simulator routes
router.use('/settings', settingsRoutes);
router.use('/alerts', alertsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/processes', processesRoutes);
router.use('/monitor', monitorRoutes);
router.use('/files', filesRoutes);
router.use('/network', networkRoutes);
router.use('/canary-session', canarySessionRoutes);

module.exports = router;
