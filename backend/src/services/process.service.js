const { ProcessEvent } = require('../models');
const { Op } = require('sequelize');
const threatScoreService = require('./threatScore.service');
const alertService = require('./alert.service');

const KNOWN_RANSOMWARE_PATTERNS = [
  'vssadmin', 'wbadmin', 'bcdedit', 'cipher', 'fsutil', 'takeown', 'icacls',
  'wevtutil', 'vssadmin', 'wmic', 'powershell', 'cmd'
];

const createEvent = async (agentId, eventData) => {
  const {
    processName, processPid, parentPid, executablePath,
    filesOpenedCount, filesReadCount, filesWrittenCount,
    filesRenamedCount, filesDeletedCount, operationsPerMin,
    cpuPercent, memoryMb, networkBytesSent, observedAt
  } = eventData;

  const suspicionReasons = [];
  let isSuspicious = false;

  // Check suspicion rules
  if (operationsPerMin > 100) {
    isSuspicious = true;
    suspicionReasons.push(`High operations per minute: ${operationsPerMin}`);
  }
  if (filesRenamedCount > 20) {
    isSuspicious = true;
    suspicionReasons.push(`High file rename count: ${filesRenamedCount}`);
  }
  if (filesDeletedCount > 50) {
    isSuspicious = true;
    suspicionReasons.push(`High file delete count: ${filesDeletedCount}`);
  }
  if (KNOWN_RANSOMWARE_PATTERNS.some(pattern => 
    (processName || '').toLowerCase().includes(pattern)
  ) {
    isSuspicious = true;
    suspicionReasons.push(`Known ransomware pattern in process name: ${processName}`);
  }
  if (cpuPercent > 85 && filesWrittenCount > 100) {
    isSuspicious = true;
    suspicionReasons.push('High CPU + high file writes`);
  }
  if (networkBytesSent > 10 * 1024 * 1024 && filesReadCount > 200) {
    isSuspicious = true;
    suspicionReasons.push('Exfiltration pattern: high network bytes + high file reads`);
  }

  const processEvent = await ProcessEvent.create({
    agentId,
    processName,
    processPid,
    parentPid,
    executablePath,
    filesOpenedCount,
    filesReadCount,
    filesWrittenCount,
    filesRenamedCount,
    filesDeletedCount,
    operationsPerMin,
    cpuPercent,
    memoryMb,
    networkBytesSent,
    isSuspicious,
    suspicionReasons,
    observedAt: new Date(observedAt)
  });

  if (isSuspicious) {
    await threatScoreService.calculateThreatScore(agentId);
    if (alertService) {
      alertService.emitProcessSuspicious(agentId, processEvent);
    }
  }

  return processEvent;
};

const createBatchEvents = async (agentId, events) => {
  const results = [];
  for (const eventData of events) {
    const event = await createEvent(agentId, eventData);
    results.push(event);
  }
  return results;
};

const getEvents = async (agentId, isSuspicious, processName, startDate, endDate, page = 1, limit = 20) => {
  const where = {};
  if (agentId) where.agentId = agentId;
  if (isSuspicious !== undefined) where.isSuspicious = isSuspicious;
  if (processName) where.processName = { [Op.like]: `%${processName}%` };
  if (startDate || endDate) {
    where.observedAt = {};
    if (startDate) where.observedAt[Op.gte] = new Date(startDate);
    if (endDate) where.observedAt[Op.lte] = new Date(endDate);
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await ProcessEvent.findAndCountAll({
    where,
    offset,
    limit,
    order: [['observedAt', 'DESC']]
  });

  return { items: rows, total: count };
};

const getEventById = async (id) => {
  return await ProcessEvent.findByPk(id);
};

const getTopThreats = async (agentId, hours = 1, limit = 10) => {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const events = await ProcessEvent.findAll({
    where: {
      agentId,
      observedAt: { [Op.gte]: since }
    }
  });

  const processStats = {};
  for (const event of events) {
    const name = event.processName;
    if (!processStats[name]) {
      processStats[name] = {
        processName: name,
        totalOperations: 0,
        maxOpsPerMin: 0,
        suspiciousEventCount: 0
      };
    }
    processStats[name].totalOperations += (event.operationsPerMin || 0);
    processStats[name].maxOpsPerMin = Math.max(
      processStats[name].maxOpsPerMin,
      event.operationsPerMin || 0
    );
    if (event.isSuspicious) {
      processStats[name].suspiciousEventCount++;
    }
  }

  return Object.values(processStats)
    .sort((a, b) => b.suspiciousEventCount - a.suspiciousEventCount)
    .slice(0, limit);
};

const getStats = async (agentId) => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const [
    totalProcessesMonitored, suspiciousProcessesLast1h, allEvents] = await Promise.all([
      ProcessEvent.count({ where: { agentId } }),
      ProcessEvent.count({
        where: { agentId, isSuspicious: true, observedAt: { [Op.gte]: oneHourAgo } }),
      ProcessEvent.findAll({ where: { agentId } })]);

  const topProcessesByFileOps = [];
  const processOpCounts = {};
  for (const event of allEvents) {
    const name = event.processName;
    const totalOps = (event.filesOpenedCount || 0) + (event.filesReadCount || 0) +
                     (event.filesWrittenCount || 0) + (event.filesRenamedCount || 0) +
                     (event.filesDeletedCount || 0);
    processOpCounts[name] = (processOpCounts[name] || 0) + totalOps;
  }

  const sortedProcesses = Object.entries(processOpCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  sortedProcesses.forEach(([name, count]) => {
    topProcessesByFileOps.push({ processName: name, totalOperations: count });
  });

  const avgOperationsPerMin = allEvents.length > 0 
    ? allEvents.reduce((sum, e) => sum + (e.operationsPerMin || 0), 0) / allEvents.length
    : 0;

  return {
    totalProcessesMonitored,
    suspiciousProcessesLast1h,
    topProcessesByFileOps,
    avgOperationsPerMin,
    processActivityTimeline: []
  };
};

module.exports = {
  createEvent,
  createBatchEvents,
  getEvents,
  getEventById,
  getTopThreats,
  getStats
};
