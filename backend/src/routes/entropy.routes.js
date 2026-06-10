const express = require('express');
const entropyController = require('../controllers/entropy.controller');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { agentAuth } = require('../middleware/agentAuth');

const router = express.Router();

router.post('/events', agentAuth, entropyController.createEvent);
router.post('/events/batch', agentAuth, entropyController.createBatchEvents);
router.get('/events', auth, requireRole('analyst', 'viewer'), entropyController.getEvents);
router.get('/events/:id', auth, requireRole('analyst', 'viewer'), entropyController.getEventById);
router.get('/stats/:agentId', auth, requireRole('analyst', 'viewer'), entropyController.getStats);
router.get('/heatmap/:agentId', auth, requireRole('analyst', 'viewer'), entropyController.getHeatmap);

module.exports = router;
