const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CanaryAlert = sequelize.define(
  'CanaryAlert',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    canaryFileId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'critical',
    },
    processName: {
      type: DataTypes.STRING(255),
    },
    processPid: {
      type: DataTypes.INTEGER,
    },
    accessType: {
      type: DataTypes.ENUM('read', 'write', 'rename', 'delete', 'encrypt'),
    },
    alertMessage: {
      type: DataTypes.TEXT,
    },
    rawEventData: {
      type: DataTypes.JSONB,
    },
    isAcknowledged: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    acknowledgedBy: {
      type: DataTypes.UUID,
    },
    acknowledgedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: 'canary_alerts',
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = CanaryAlert;
