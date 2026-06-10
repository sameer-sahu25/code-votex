const express = require('express');
const processController = require('../controllers/process.controller');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { agentAuth } = require('../middleware/agentAuth');

const router = express.Router();

router.post('/events', agentAuth, processController.createEvent);
router.post('/events/batch', agentAuth, processController.createBatchEvents);
router.get('/events', auth, requireRole('analyst', 'viewer'), processController.getEvents);
router.get('/events/:id', auth, requireRole('analyst', 'viewer'), processController.getEventById);
router.get('/top-threats/:agentId', auth, requireRole('analyst', 'viewer'), processController.getTopThreats);
router.get('/stats/:agentId', auth, requireRole('analyst', 'viewer'), processController.getStats);

module.exports = router;
