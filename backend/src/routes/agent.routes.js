const express = require('express');
const agentController = require('../controllers/agent.controller');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { auditLogger } = require('../middleware/auditLogger');
const { createAgentSchema, updateAgentSchema } = require('../validators/agent.validator');

const router = express.Router();

router.post('/', auth, requireRole('admin'), validate(createAgentSchema), auditLogger('create', 'Agent'), agentController.createAgent);
router.get('/', auth, requireRole('analyst', 'viewer'), agentController.getAgents);
router.get('/:agentId', auth, requireRole('analyst', 'viewer'), agentController.getAgentById);
router.patch('/:agentId', auth, requireRole('admin'), validate(updateAgentSchema), auditLogger('update', 'Agent'), agentController.updateAgent);
router.delete('/:agentId', auth, requireRole('admin'), auditLogger('delete', 'Agent'), agentController.deleteAgent);
router.post('/:agentId/heartbeat', agentController.heartbeat);
router.post('/:agentId/rotate-key', auth, requireRole('admin'), auditLogger('rotate-key', 'Agent'), agentController.rotateAgentKey);

module.exports = router;
