const express = require('express');
const killswitchController = require('../controllers/killswitch.controller');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { agentAuth } = require('../middleware/agentAuth');

const router = express.Router();

router.post('/trigger/:agentId', auth, requireRole('admin'), killswitchController.trigger);
router.post('/restore/:agentId', auth, requireRole('admin'), killswitchController.restore);
router.get('/logs', auth, requireRole('analyst', 'viewer'), killswitchController.getLogs);
router.get('/logs/:id', auth, requireRole('analyst', 'viewer'), killswitchController.getLogById);
router.post('/agent-confirm/:agentId', agentAuth, killswitchController.agentConfirm);

module.exports = router;
