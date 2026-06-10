const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

router.get('/overview', auth, requireRole('analyst', 'viewer'), analyticsController.getOverview);
router.get('/agents/comparison', auth, requireRole('analyst', 'viewer'), analyticsController.getAgentsComparison);
router.get('/threats/patterns', auth, requireRole('analyst', 'viewer'), analyticsController.getThreatPatterns);
router.get('/export', auth, requireRole('admin'), analyticsController.exportData);

module.exports = router;
