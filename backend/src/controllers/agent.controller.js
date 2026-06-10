const agentService = require('../services/agent.service');
const { success, error, paginate } = require('../utils/response');

const createAgent = async (req, res) => {
  try {
    const { hostname, osType, metadata } = req.body;
    const { agent, agentKey } = await agentService.createAgent(
      req.user.id,
      hostname,
      osType,
      metadata
    );
    return success(res, { agent, agentKey }, 'Agent created successfully', 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const getAgents = async (req, res) => {
  try {
    const agents = await agentService.getAgents(req.user.id, req.user.role);
    return success(res, agents, 'Agents retrieved successfully');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getAgentById = async (req, res) => {
  try {
    const agent = await agentService.getAgentById(
      req.params.agentId,
      req.user.id,
      req.user.role
    );
    if (!agent) {
      return error(res, 'Agent not found', 404);
    }
    return success(res, agent, 'Agent retrieved successfully');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const updateAgent = async (req, res) => {
  try {
    const agent = await agentService.updateAgent(req.params.agentId, req.body);
    return success(res, agent, 'Agent updated successfully');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const deleteAgent = async (req, res) => {
  try {
    await agentService.deleteAgent(req.params.agentId);
    return success(res, null, 'Agent deleted successfully');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const heartbeat = async (req, res) => {
  try {
    const agentKey = req.headers['x-agent-key'];
    if (!agentKey) {
      return error(res, 'Agent key required', 401);
    }
    const agent = await agentService.heartbeat(agentKey, req.ip);
    return success(res, { agent, serverTime: new Date() }, 'Heartbeat received');
  } catch (err) {
    return error(res, err.message, 404);
  }
};

const rotateAgentKey = async (req, res) => {
  try {
    const { agent, agentKey } = await agentService.rotateAgentKey(req.params.agentId);
    return success(res, { agent, agentKey }, 'Agent key rotated successfully');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = {
  createAgent,
  getAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  heartbeat,
  rotateAgentKey,
};
