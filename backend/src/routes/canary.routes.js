const express = require('express');
const canaryController = require('../controllers/canary.controller');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { agentAuth } = require('../middleware/agentAuth');

const router = express.Router();

router.post('/files', agentAuth, canaryController.registerCanaryFile);
router.get('/files', auth, requireRole('analyst', 'viewer'), canaryController.getCanaryFiles);
router.get('/files/:id', auth, requireRole('analyst', 'viewer'), canaryController.getCanaryFileById);
router.delete('/files/:id', auth, requireRole('admin'), canaryController.deleteCanaryFile);

router.post('/alerts', agentAuth, canaryController.createCanaryAlert);
router.get('/alerts', auth, requireRole('analyst', 'viewer'), canaryController.getCanaryAlerts);
router.get('/alerts/:id', auth, requireRole('analyst', 'viewer'), canaryController.getCanaryAlertById);
router.patch('/alerts/:id/acknowledge', auth, requireRole('analyst', 'viewer'), canaryController.acknowledgeAlert);
router.post('/alerts/bulk-acknowledge', auth, requireRole('analyst', 'viewer'), canaryController.bulkAcknowledge);

module.exports = router;
