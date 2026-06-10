const { ThreatScore, CanaryAlert, EntropyEvent, ProcessEvent, Agent, KillSwitchLog } = require('../models');
const { Op } = require('sequelize');
const constants = require('../utils/constants');
const killswitchService = require('./killswitch.service');
const alertService = require('./alert.service');
const axios = require('axios');
const logger = require('../config/logger');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const calculateThreatScore = async (agentId) => {
  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

  // Step 1: Canary signal (0.45)
  const activeCanaryAlerts = await CanaryAlert.count({
    where: {
      agentId,
      isAcknowledged: false,
      createdAt: { [Op.gte]: tenMinutesAgo }
    }
  });
  let canaryScore = 0;
  if (activeCanaryAlerts === 0) canaryScore = 0;
  else if (activeCanaryAlerts === 1) canaryScore = 90;
  else canaryScore = 100;

  // Step 2: Entropy signal (0.30)
  const entropyAnomalies = await EntropyEvent.findAll({
    where: {
      agentId,
      isAnomaly: true,
      sampledAt: { [Op.gte]: tenMinutesAgo }
    }
  });
  const entropyAnomalyCount = entropyAnomalies.length;
  const maxEntropyScore = entropyAnomalyCount > 0 
    ? Math.max(...entropyAnomalies.map(e => parseFloat(e.entropyScore))) 
    : 0;
  const avgEntropyScore = entropyAnomalyCount > 0 
    ? entropyAnomalies.reduce((sum, e) => sum + parseFloat(e.entropyScore), 0) / entropyAnomalyCount 
    : 0;
  
  let entropyScore = 0;
  if (entropyAnomalyCount === 0) entropyScore = 0;
  else if (entropyAnomalyCount >= 1 && entropyAnomalyCount <= 3) {
    entropyScore = 30 + (maxEntropyScore - 7.0) * 40;
  } else if (entropyAnomalyCount >= 4 && entropyAnomalyCount <= 10) {
    entropyScore = 60 + (entropyAnomalyCount * 4);
  } else {
    entropyScore = 100;
  }
  entropyScore = Math.min(100, Math.max(0, entropyScore));

  // Step 3: Process signal (0.25)
  const suspiciousProcs = await ProcessEvent.findAll({
    where: {
      agentId,
      isSuspicious: true,
      observedAt: { [Op.gte]: tenMinutesAgo }
    }
  });
  const suspiciousCount = suspiciousProcs.length;
  const maxOpsPerMin = suspiciousCount > 0 
    ? Math.max(...suspiciousProcs.map(p => parseFloat(p.operationsPerMin || 0))) 
    : 0;
  
  let processScore = 0;
  if (suspiciousCount === 0) processScore = 0;
  else if (maxOpsPerMin < 100) processScore = 20;
  else if (maxOpsPerMin >= 100 && maxOpsPerMin <= 300) processScore = 50;
  else if (maxOpsPerMin > 300 && maxOpsPerMin <= 500) processScore = 70;
  else processScore = 90;
  processScore += (suspiciousCount * 2);
  processScore = Math.min(100, processScore);

  // Step 4: Weighted combination
  const ruleBasedScore = Math.round(
    (canaryScore * 0.45) + (entropyScore * 0.30) + (processScore * 0.25)
  );

  let mlAdjustedScore = ruleBasedScore;
  let mlConfidence = 0.0;
  let mlDelta = 0;

  try {
    const lastAlert = await CanaryAlert.findOne({
      where: { agentId },
      order: [['createdAt', 'DESC']]
    });
    const timeSinceLastAlertMinutes = lastAlert 
      ? (now - lastAlert.createdAt) / (1000 * 60) 
      : 10000;

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDayScores = await ThreatScore.findAll({
      where: { agentId, calculatedAt: { [Op.gte]: sevenDaysAgo } },
      attributes: ['score']
    });
    const historicalAvg7d = sevenDayScores.length > 0 
      ? sevenDayScores.reduce((sum, s) => sum + s.score, 0) / sevenDayScores.length 
      : 0;

    const mlRequest = {
      agentId,
      ruleBasedScore,
      canaryAlertCount: activeCanaryAlerts,
      entropyAnomalyCount,
      maxEntropyScore,
      avgEntropyScore,
      suspiciousProcessCount: suspiciousCount,
      maxOpsPerMinute: maxOpsPerMin,
      filesRenamedTotal: suspiciousProcs.reduce((sum, p) => sum + (p.filesRenamedCount || 0), 0),
      filesDeletedTotal: suspiciousProcs.reduce((sum, p) => sum + (p.filesDeletedCount || 0), 0),
      networkBytesSentTotal: suspiciousProcs.reduce((sum, p) => sum + (p.networkBytesSent || 0), 0),
      hourOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      agentBaselineDeviation: 0.0,
      historicalAvgScore7d: historicalAvg7d,
      timeSinceLastAlertMinutes
    };

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/ml/v1/threat/adjust`, mlRequest);
    mlAdjustedScore = mlResponse.data.adjustedScore;
    mlDelta = mlResponse.data.delta;
    mlConfidence = mlResponse.data.confidence;
  } catch (err) {
    console.error('ML service request failed:', err.message);
  }

  // Step 5: Verdict
  let verdict = 'safe';
  if (mlAdjustedScore >= 80) verdict = 'ransomware';
  else if (mlAdjustedScore >= 60) verdict = 'dangerous';
  else if (mlAdjustedScore >= 30) verdict = 'suspicious';

  // Step 6: Persist and emit
  const threatScore = await ThreatScore.create({
    agentId,
    score: mlAdjustedScore,
    verdict,
    canaryScore,
    entropyScore,
    processScore,
    canaryWeight: 0.45,
    entropyWeight: 0.30,
    processWeight: 0.25,
    activeCanaryAlerts,
    activeEntropyAnomalies: entropyAnomalyCount,
    activeSuspiciousProcs: suspiciousCount,
    triggerDetails: {
      mlAdjustedScore,
      mlDelta,
      mlConfidence,
      ruleBasedScore,
      breakdown: {
        canary: { score: canaryScore, weight: 0.45 },
        entropy: { score: entropyScore, weight: 0.30 },
        process: { score: processScore, weight: 0.25 }
      }
    },
    calculatedAt: now
  });

  // Emit socket event
  if (alertService) {
    alertService.emitThreatScoreUpdate(agentId, threatScore);
  }

  // Auto-trigger kill switch if score >= 80
  if (mlAdjustedScore >= 80) {
    const lastKillSwitch = await KillSwitchLog.findOne({
      where: { agentId },
      order: [['createdAt', 'DESC']]
    });
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const shouldTrigger = !lastKillSwitch || 
      lastKillSwitch.createdAt < fiveMinutesAgo || 
      lastKillSwitch.action !== 'isolated';
    
    if (shouldTrigger) {
      try {
        await killswitchService.triggerKillSwitch(agentId, 'auto', null, mlAdjustedScore);
      } catch (err) {
        console.error('Failed to auto-trigger kill switch:', err.message);
      }
    }
  }

  return threatScore;
};

const getThreatScores = async (agentId, hours = 24, page = 1, limit = 20) => {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const offset = (page - 1) * limit;
  
  const { count, rows } = await ThreatScore.findAndCountAll({
    where: {
      agentId,
      calculatedAt: { [Op.gte]: since }
    },
    offset,
    limit,
    order: [['calculatedAt', 'DESC']]
  });

  // Calculate verdict distribution
  const distribution = {
    safe: 0,
    suspicious: 0,
    dangerous: 0,
    ransomware: 0
  };
  rows.forEach(s => {
    distribution[s.verdict] = (distribution[s.verdict] || 0) + 1;
  });

  return {
    items: rows,
    total: count,
    distribution
  };
};

const getLatestThreatScore = async (agentId) => {
  return await ThreatScore.findOne({
    where: { agentId },
    order: [['calculatedAt', 'DESC']]
  });
};

const getThreatTimeline = async (agentId, startDate, endDate, interval = 'hour') => {
  const where = { agentId };
  if (startDate) where.calculatedAt = { ...where.calculatedAt, [Op.gte]: new Date(startDate) };
  if (endDate) where.calculatedAt = { ...where.calculatedAt, [Op.lte]: new Date(endDate) };

  const scores = await ThreatScore.findAll({
    where,
    order: [['calculatedAt', 'ASC']]
  });

  return scores.map(s => ({
    timestamp: s.calculatedAt,
    score: s.score,
    verdict: s.verdict
  }));
};

const getDashboardStats = async (userId, role) => {
  const agentWhere = role === 'admin' ? {} : { userId };
  
  const agents = await Agent.findAll({ where: agentWhere });
  const agentIds = agents.map(a => a.id);

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const [
    totalAgents,
    onlineAgents,
    quarantinedAgents,
    criticalAlerts,
    recentAnomalies,
    allThreatScores
  ] = await Promise.all([
    Agent.count({ where: agentWhere }),
    Agent.count({ where: { ...agentWhere, status: 'online' } }),
    Agent.count({ where: { ...agentWhere, status: 'quarantined' } }),
    CanaryAlert.findAll({
      where: { agentId: { [Op.in]: agentIds }, isAcknowledged: false },
      include: [Agent],
      order: [['createdAt', 'DESC']],
      limit: 20
    }),
    EntropyEvent.findAll({
      where: { agentId: { [Op.in]: agentIds }, isAnomaly: true },
      include: [Agent],
      order: [['sampledAt', 'DESC']],
      limit: 10
    }),
    ThreatScore.findAll({
      where: { agentId: { [Op.in]: agentIds } },
      order: [['calculatedAt', 'DESC']],
      include: [Agent]
    })
  ]);

  const activeThreats = allThreatScores.filter(s => s.score >= 60);
  const uniqueActiveThreats = [];
  const seenAgents = new Set();
  for (const s of activeThreatScores) {
    if (!seenAgents.has(s.agentId)) {
      seenAgents.add(s.agentId);
      uniqueActiveThreats.push(s);
    }
  }

  const systemThreatLevel = allThreatScores.length > 0 
    ? Math.max(...allThreatScores.map(s => s.score)) 
    : 0;

  const scoreDistribution = { safe: 0, suspicious: 0, dangerous: 0, ransomware: 0 };
  const latestScores = new Map();
  for (const s of allThreatScores) {
    if (!latestScores.has(s.agentId) || s.calculatedAt > latestScores.get(s.agentId).calculatedAt) {
      latestScores.set(s.agentId, s);
    }
  }
  latestScores.forEach(s => {
    scoreDistribution[s.verdict] = (scoreDistribution[s.verdict] || 0) + 1;
  });

  return {
    totalAgents,
    onlineAgents,
    quarantinedAgents,
    activeThreats: uniqueActiveThreats,
    criticalAlerts,
    recentAnomalies,
    systemThreatLevel,
    scoreDistribution
  };
};

module.exports = {
  calculateThreatScore,
  getThreatScores,
  getLatestThreatScore,
  getThreatTimeline,
  getDashboardStats
};
