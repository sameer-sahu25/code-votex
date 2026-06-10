const { CanaryAlert, EntropyEvent, ProcessEvent, ThreatScore, KillSwitchLog, Agent } = require('../models');
const { Op } = require('sequelize');

const getOverview = async (startDate, endDate) => {
  const where = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) where.createdAt[Op.lte] = new Date(endDate);
  }

  const [
    canaryAlerts,
    entropyAnomalies,
    suspiciousProcs,
    threatScores,
    killSwitchEvents
  ] = await Promise.all([
    CanaryAlert.findAll({ where }),
    EntropyEvent.findAll({ where: { ...where, isAnomaly: true } }),
    ProcessEvent.findAll({ where: { ...where, isSuspicious: true } }),
    ThreatScore.findAll({ where }),
    KillSwitchLog.findAll({ where })
  ]);

  const canaryBySeverity = {};
  canaryAlerts.forEach(a => {
    canaryBySeverity[a.severity] = (canaryBySeverity[a.severity] || 0) + 1;
  });

  const avgEntropyScore = entropyAnomalies.length > 0 
    ? entropyAnomalies.reduce((sum, e) => sum + Number(e.entropyScore), 0) / entropyAnomalies.length
    : 0;
  const maxEntropyScore = entropyAnomalies.length > 0 
    ? Math.max(...entropyAnomalies.map(e => Number(e.entropyScore)))
    : 0;

  const topProcessesMap = {};
  suspiciousProcs.forEach(p => {
    topProcessesMap[p.processName] = (topProcessesMap[p.processName] || 0) + 1;
  });
  const topProcesses = Object.entries(topProcessesMap)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const avgThreatScore = threatScores.length > 0 
    ? threatScores.reduce((sum, s) => sum + s.score, 0) / threatScores.length
    : 0;
  const maxThreatScore = threatScores.length > 0 
    ? Math.max(...threatScores.map(s => s.score))
    : 0;

  const verdictDistribution = {};
  threatScores.forEach(s => {
    verdictDistribution[s.verdict] = (verdictDistribution[s.verdict] || 0) + 1;
  });

  const autoTriggeredCount = killSwitchEvents.filter(e => e.triggeredBy === 'auto').length;
  const manualTriggeredCount = killSwitchEvents.filter(e => e.triggeredBy === 'manual').length;

  return {
    canaryAlerts: {
      total: canaryAlerts.length,
      bySeverity: canaryBySeverity,
      timeline: []
    },
    entropyAnomalies: {
      total: entropyAnomalies.length,
      avgScore: avgEntropyScore,
      maxScore: maxEntropyScore,
      timeline: []
    },
    suspiciousProcs: {
      total: suspiciousProcs.length,
      topProcesses,
      timeline: []
    },
    threatScores: {
      avgScore: avgThreatScore,
      maxScore: maxThreatScore,
      verdictDistribution,
      timeline: []
    },
    killSwitchEvents: {
      total: killSwitchEvents.length,
      autoTriggered: autoTriggeredCount,
      manualTriggered: manualTriggeredCount
    }
  };
};

const getAgentsComparison = async () => {
  const agents = await Agent.findAll();
  const comparisons = await Promise.all(agents.map(async agent => {
    const [
      canaryCount,
      entropyAnomalyCount,
      suspiciousProcCount,
      latestScore,
      totalKillSwitches
    ] = await Promise.all([
      CanaryAlert.count({ where: { agentId: agent.id } }),
      EntropyEvent.count({ where: { agentId: agent.id, isAnomaly: true } }),
      ProcessEvent.count({ where: { agentId: agent.id, isSuspicious: true } }),
      ThreatScore.findOne({ where: { agentId: agent.id }, order: [['createdAt', 'DESC']] }),
      KillSwitchLog.count({ where: { agentId: agent.id } })
    ]);

    return {
      agentId: agent.id,
      agentName: agent.name,
      status: agent.status,
      canaryAlertCount: canaryCount,
      entropyAnomalyCount,
      suspiciousProcessCount: suspiciousProcCount,
      latestThreatScore: latestScore ? latestScore.score : null,
      totalKillSwitches
    };
  }));
  return comparisons;
};

const getThreatPatterns = async (agentId, days = 7) => {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const where = { agentId, createdAt: { [Op.gte]: startDate } };

  const [canaryAlerts, entropyEvents, processEvents, threatScores] = await Promise.all([
    CanaryAlert.findAll({ where }),
    EntropyEvent.findAll({ where }),
    ProcessEvent.findAll({ where }),
    ThreatScore.findAll({ where })
  ]);

  const hourlyStats = {};
  const dayStats = {};
  const allEvents = [
    ...canaryAlerts.map(e => ({ type: 'canary', timestamp: new Date(e.createdAt) })),
    ...entropyEvents.filter(e => e.isAnomaly).map(e => ({ type: 'entropy', timestamp: new Date(e.createdAt) })),
    ...processEvents.filter(e => e.isSuspicious).map(e => ({ type: 'process', timestamp: new Date(e.createdAt) }))
  ];

  allEvents.forEach(e => {
    const hour = e.timestamp.getHours();
    const day = e.timestamp.getDay();

    if (!hourlyStats[hour]) {
      hourlyStats[hour] = { hour, totalEvents: 0, totalThreat: 0 };
    }
    hourlyStats[hour].totalEvents += 1;
    hourlyStats[hour].totalThreat += 50;

    if (!dayStats[day]) {
      dayStats[day] = { dayOfWeek: day, totalEvents: 0, avgThreatLevel: 0 };
    }
    dayStats[day].totalEvents += 1;
  });

  Object.values(hourlyStats).forEach(stat => {
    stat.avgThreatLevel = stat.totalThreat / stat.totalEvents || 0;
  });

  Object.values(dayStats).forEach(stat => {
    stat.avgThreatLevel = 50;
  });

  return {
    attackPatterns: [],
    riskWindows: Object.values(hourlyStats).map(s => ({
      hour: s.hour,
      dayOfWeek: 1,
      avgThreatLevel: s.avgThreatLevel
    }))
  };
};

const exportData = async (startDate, endDate, format, types) => {
  const where = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) where.createdAt[Op.lte] = new Date(endDate);
  }

  const result = {};

  if (types.includes('canary')) {
    result.canary = await CanaryAlert.findAll({ where });
  }
  if (types.includes('entropy')) {
    result.entropy = await EntropyEvent.findAll({ where });
  }
  if (types.includes('process')) {
    result.process = await ProcessEvent.findAll({ where });
  }
  if (types.includes('threat')) {
    result.threat = await ThreatScore.findAll({ where });
  }

  return result;
};

module.exports = {
  getOverview,
  getAgentsComparison,
  getThreatPatterns,
  exportData
};
