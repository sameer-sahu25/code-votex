const { EntropyEvent } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const constants = require('../utils/constants');

const createEvent = async (
  agentId,
  filePath,
  fileName,
  fileExtension,
  entropyScore,
  fileSize,
  previousScore,
  sampledAt
) => {
  const scoreDelta = previousScore !== null ? entropyScore - previousScore : 0;
  let isAnomaly = false;
  let anomalyReason = '';

  if (entropyScore > constants.ENTROPY.ANOMALY_THRESHOLD) {
    isAnomaly = true;
    anomalyReason = `Entropy score ${entropyScore} exceeds threshold of ${constants.ENTROPY.ANOMALY_THRESHOLD}`;
  } else if (previousScore !== null && scoreDelta > constants.ENTROPY.DELTA_THRESHOLD) {
    isAnomaly = true;
    anomalyReason = `Entropy delta ${scoreDelta} exceeds threshold of ${constants.ENTROPY.DELTA_THRESHOLD}`;
  }

  const event = await EntropyEvent.create({
    agentId,
    filePath,
    fileName,
    fileExtension,
    entropyScore,
    fileSize,
    previousScore,
    scoreDelta,
    isAnomaly,
    anomalyReason,
    sampledAt: new Date(sampledAt),
  });

  return event;
};

const createBatchEvents = async (events) => {
  const results = [];
  let anomalyCount = 0;

  for (const eventData of events) {
    const event = await createEvent(
      eventData.agentId,
      eventData.filePath,
      eventData.fileName,
      eventData.fileExtension,
      eventData.entropyScore,
      eventData.fileSize,
      eventData.previousScore,
      eventData.sampledAt
    );
    if (event.isAnomaly) anomalyCount++;
    results.push(event);
  }

  return { total: events.length, anomalies: anomalyCount, saved: results.length };
};

const getEvents = async (
  agentId,
  isAnomaly,
  minScore,
  maxScore,
  startDate,
  endDate,
  page = 1,
  limit = 20
) => {
  const where = {};
  if (agentId) where.agentId = agentId;
  if (isAnomaly !== undefined) where.isAnomaly = isAnomaly;
  if (minScore !== undefined || maxScore !== undefined) {
    where.entropyScore = {};
    if (minScore !== undefined) where.entropyScore[Op.gte] = minScore;
    if (maxScore !== undefined) where.entropyScore[Op.lte] = maxScore;
  }
  if (startDate || endDate) {
    where.sampledAt = {};
    if (startDate) where.sampledAt[Op.gte] = new Date(startDate);
    if (endDate) where.sampledAt[Op.lte] = new Date(endDate);
  }

  const { count, rows } = await EntropyEvent.findAndCountAll({
    where,
    offset: (page - 1) * limit,
    limit,
    order: [['sampledAt', 'DESC']],
  });

  return { items: rows, total: count };
};

const getEventById = async (id) => {
  return await EntropyEvent.findByPk(id);
};

const getStats = async (agentId) => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [avg1hResult, avg24hResult, anomalies1hResult, anomalies24hResult] =
    await Promise.all([
      EntropyEvent.findOne({
        where: { agentId, sampledAt: { [Op.gte]: oneHourAgo } },
        attributes: [[sequelize.fn('AVG', sequelize.col('entropyScore')), 'avgScore']],
      }),
      EntropyEvent.findOne({
        where: { agentId, sampledAt: { [Op.gte]: oneDayAgo } },
        attributes: [[sequelize.fn('AVG', sequelize.col('entropyScore')), 'avgScore']],
      }),
      EntropyEvent.count({
        where: { agentId, isAnomaly: true, sampledAt: { [Op.gte]: oneHourAgo } },
      }),
      EntropyEvent.count({
        where: { agentId, isAnomaly: true, sampledAt: { [Op.gte]: oneDayAgo } },
      }),
    ]);

  const topAnomalousFiles = await EntropyEvent.findAll({
    where: { agentId, isAnomaly: true, sampledAt: { [Op.gte]: oneDayAgo } },
    attributes: [
      'filePath',
      [sequelize.fn('MAX', sequelize.col('entropyScore')), 'maxScore'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'occurrences'],
    ],
    group: ['filePath'],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
    limit: 10,
  });

  const entropyTrend = [];
  for (let i = 23; i >= 0; i--) {
    const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
    const result = await EntropyEvent.findOne({
      where: { agentId, sampledAt: { [Op.gte]: hourStart, [Op.lt]: hourEnd } },
      attributes: [[sequelize.fn('AVG', sequelize.col('entropyScore')), 'avgScore']],
    });
    entropyTrend.push({
      hour: hourStart.getHours(),
      avgScore: result?.dataValues?.avgScore || 0,
    });
  }

  return {
    avgEntropyLast1h: parseFloat(avg1hResult?.dataValues?.avgScore || 0),
    avgEntropyLast24h: parseFloat(avg24hResult?.dataValues?.avgScore || 0),
    anomalyCountLast1h: anomalies1hResult,
    anomalyCountLast24h: anomalies24hResult,
    topAnomalousFiles,
    entropyTrend,
  };
};

const getHeatmap = async (agentId, startDate, endDate) => {
  const where = { agentId };
  if (startDate || endDate) {
    where.sampledAt = {};
    if (startDate) where.sampledAt[Op.gte] = new Date(startDate);
    if (endDate) where.sampledAt[Op.lte] = new Date(endDate);
  }

  const events = await EntropyEvent.findAll({ where });

  const heatmap = Array(7)
    .fill(null)
    .map(() => Array(24).fill(null).map(() => ({ avgScore: 0, eventCount: 0 })));

  for (const event of events) {
    const day = event.sampledAt.getDay();
    const hour = event.sampledAt.getHours();
    const cell = heatmap[day][hour];
    const newCount = cell.eventCount + 1;
    const newAvg = (cell.avgScore * cell.eventCount + parseFloat(event.entropyScore)) / newCount;
    heatmap[day][hour] = { avgScore: newAvg, eventCount: newCount };
  }

  const result = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      result.push({
        day,
        hour,
        ...heatmap[day][hour],
      });
    }
  }
  return result;
};

module.exports = {
  createEvent,
  createBatchEvents,
  getEvents,
  getEventById,
  getStats,
  getHeatmap,
};
