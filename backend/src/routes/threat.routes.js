const express = require('express');
const threatController = require('../controllers/threat.controller');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

router.get('/score/:agentId', auth, requireRole('analyst', 'viewer'), threatController.getScore);
router.get('/score/:agentId/history', auth, requireRole('analyst', 'viewer'), threatController.getScoreHistory);
router.get('/score/:agentId/timeline', auth, requireRole('analyst', 'viewer'), threatController.getScoreTimeline);
router.post('/score/:agentId/calculate', auth, requireRole('admin'), threatController.calculateScore);
router.get('/dashboard', auth, requireRole('analyst', 'viewer'), threatController.getDashboard);

module.exports = router;
