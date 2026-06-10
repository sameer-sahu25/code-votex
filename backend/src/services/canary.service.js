const { CanaryFile, CanaryAlert } = require('../models');
const { Op } = require('sequelize');

const registerCanaryFile = async (agentId, filePath, fileName, fileHash) => {
  const canaryFile = await CanaryFile.create({
    agentId,
    filePath,
    fileName,
    fileHash,
  });
  return canaryFile;
};

const getCanaryFiles = async (agentId, isTriggered, page = 1, limit = 20) => {
  const where = {};
  if (agentId) where.agentId = agentId;
  if (isTriggered !== undefined) where.isTriggered = isTriggered;

  const { count, rows } = await CanaryFile.findAndCountAll({
    where,
    offset: (page - 1) * limit,
    limit,
    order: [['createdAt', 'DESC']],
  });

  return { items: rows, total: count };
};

const getCanaryFileById = async (id) => {
  return await CanaryFile.findByPk(id);
};

const createCanaryAlert = async (
  canaryFileId,
  agentId,
  processName,
  processPid,
  accessType,
  rawEventData
) => {
  const canaryFile = await CanaryFile.findByPk(canaryFileId);
  if (!canaryFile) {
    throw new Error('Canary file not found');
  }

  await canaryFile.update({
    isTriggered: true,
    triggeredAt: new Date(),
    triggeringProcess: processName,
    triggeringPid: processPid,
  });

  const alert = await CanaryAlert.create({
    canaryFileId,
    agentId,
    severity: 'critical',
    processName,
    processPid,
    accessType,
    alertMessage: `Canary file ${canaryFile.fileName} accessed by ${processName} (PID: ${processPid})`,
    rawEventData,
  });

  return alert;
};

const getCanaryAlerts = async (
  agentId,
  severity,
  isAcknowledged,
  startDate,
  endDate,
  page = 1,
  limit = 20
) => {
  const where = {};
  if (agentId) where.agentId = agentId;
  if (severity) where.severity = severity;
  if (isAcknowledged !== undefined) where.isAcknowledged = isAcknowledged;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) where.createdAt[Op.lte] = new Date(endDate);
  }

  const { count, rows } = await CanaryAlert.findAndCountAll({
    where,
    offset: (page - 1) * limit,
    limit,
    include: [CanaryFile],
    order: [['createdAt', 'DESC']],
  });

  return { items: rows, total: count };
};

const getCanaryAlertById = async (id) => {
  return await CanaryAlert.findByPk(id, { include: [CanaryFile] });
};

const acknowledgeAlert = async (alertId, userId) => {
  const alert = await CanaryAlert.findByPk(alertId);
  await alert.update({
    isAcknowledged: true,
    acknowledgedBy: userId,
    acknowledgedAt: new Date(),
  });
  return alert;
};

const bulkAcknowledge = async (alertIds, userId) => {
  await CanaryAlert.update(
    {
      isAcknowledged: true,
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
    },
    {
      where: { id: alertIds },
    }
  );
};

const deleteCanaryFile = async (id) => {
  await CanaryFile.destroy({ where: { id } });
};

module.exports = {
  registerCanaryFile,
  getCanaryFiles,
  getCanaryFileById,
  createCanaryAlert,
  getCanaryAlerts,
  getCanaryAlertById,
  acknowledgeAlert,
  bulkAcknowledge,
  deleteCanaryFile,
};
