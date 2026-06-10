const { KillSwitchLog, Agent } = require('../models');
const threatScoreService = require('./threatScore.service');
const alertService = require('./alert.service');

const triggerKillSwitch = async (agentId, triggeredBy, triggeredByUserId, threatScoreAtTrigger, reason) => {
  const agent = await Agent.findByPk(agentId);
  if (!agent) {
    throw new Error('Agent not found');
  }

  const latestScore = await threatScoreService.getLatestThreatScore(agentId);
  const currentScore = latestScore ? latestScore.score : 0;
  const minScore = triggeredBy === 'auto' ? 80 : 60;

  if (currentScore < minScore) {
    throw new Error('Threat score too low to trigger kill switch');
  }

  await agent.update({ status: 'quarantined' });

  const killSwitchLog = await KillSwitchLog.create({
    agentId,
    triggeredBy,
    triggeredByUserId,
    threatScoreAtTrigger: threatScoreAtTrigger || currentScore,
    action: 'network_disabled',
    commandIssued: 'isolate-agent',
    success: true,
    executedAt: new Date()
  });

  alertService.emitKillSwitchTriggered(agentId, killSwitchLog);
  alertService.emitAgentStatus(agentId, 'quarantined');

  return killSwitchLog;
};

const restoreAgent = async (agentId, triggeredByUserId, reason) => {
  const agent = await Agent.findByPk(agentId);
  if (!agent) {
    throw new Error('Agent not found');
  }

  await agent.update({ status: 'online' });

  const killSwitchLog = await KillSwitchLog.create({
    agentId,
    triggeredBy: 'manual',
    triggeredByUserId,
    threatScoreAtTrigger: null,
    action: 'network_restored',
    commandIssued: 'restore-agent',
    success: true,
    executedAt: new Date()
  });

  alertService.emitKillSwitchRestore(agentId, killSwitchLog);
  alertService.emitAgentStatus(agentId, 'online');

  return killSwitchLog;
};

const getLogs = async (agentId, triggeredBy, action, startDate, endDate, page = 1, limit = 20) => {
  const where = {};
  if (agentId) where.agentId = agentId;
  if (triggeredBy) where.triggeredBy = triggeredBy;
  if (action) where.action = action;
  if (startDate || endDate) {
    where.executedAt = {};
    if (startDate) where.executedAt[require('sequelize').Op.gte] = new Date(startDate);
    if (endDate) where.executedAt[require('sequelize').Op.lte] = new Date(endDate);
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await KillSwitchLog.findAndCountAll({
    where,
    offset,
    limit,
    include: [Agent],
    order: [['executedAt', 'DESC']]
  });

  return { items: rows, total: count };
};

const getLogById = async (id) => {
  return await KillSwitchLog.findByPk(id, { include: [Agent] });
};

const agentConfirm = async (agentId, commandOutput, success, errorMessage) => {
  const latestLog = await KillSwitchLog.findOne({
    where: { agentId },
    order: [['createdAt', 'DESC']]
  });

  if (!latestLog) {
    throw new Error('No kill switch log found');
  }

  await latestLog.update({
    commandOutput,
    success,
    errorMessage
  });

  return latestLog;
};

module.exports = {
  triggerKillSwitch,
  restoreAgent,
  getLogs,
  getLogById,
  agentConfirm
};
