const { v4: uuidv4 } = require('uuid');
const { Agent, ThreatScore } = require('../models');

const createAgent = async (userId, hostname, osType, metadata) => {
  const agentKey = uuidv4();
  const agent = await Agent.create({
    userId,
    agentKey,
    hostname,
    osType,
    metadata,
  });
  return { agent, agentKey };
};

const getAgents = async (userId, role) => {
  const where = role === 'admin' ? {} : { userId };
  const agents = await Agent.findAll({
    where,
    include: [
      {
        model: ThreatScore,
        as: 'ThreatScores',
        limit: 1,
        order: [['calculatedAt', 'DESC']],
      },
    ],
    order: [['updatedAt', 'DESC']],
  });
  return agents;
};

const getAgentById = async (agentId, userId, role) => {
  const where = { id: agentId };
  if (role !== 'admin') {
    where.userId = userId;
  }
  const agent = await Agent.findOne({ where });
  return agent;
};

const updateAgent = async (agentId, data) => {
  const agent = await Agent.findByPk(agentId);
  await agent.update(data);
  return agent;
};

const deleteAgent = async (agentId) => {
  const agent = await Agent.findByPk(agentId);
  await agent.update({ isActive: false });
};

const heartbeat = async (agentKey, ipAddress) => {
  const agent = await Agent.findOne({ where: { agentKey } });
  if (!agent) {
    throw new Error('Agent not found');
  }

  await agent.update({
    status: 'online',
    lastHeartbeatAt: new Date(),
    ipAddress,
  });
  return agent;
};

const rotateAgentKey = async (agentId) => {
  const agentKey = uuidv4();
  const agent = await Agent.findByPk(agentId);
  await agent.update({ agentKey });
  return { agent, agentKey };
};

const getAgentByKey = async (agentKey) => {
  return await Agent.findOne({ where: { agentKey } });
};

module.exports = {
  createAgent,
  getAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  heartbeat,
  rotateAgentKey,
  getAgentByKey,
};
