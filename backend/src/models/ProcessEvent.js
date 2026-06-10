const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProcessEvent = sequelize.define(
  'ProcessEvent',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    processName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    processPid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    parentPid: {
      type: DataTypes.INTEGER,
    },
    executablePath: {
      type: DataTypes.TEXT,
    },
    filesOpenedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    filesReadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    filesWrittenCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    filesRenamedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    filesDeletedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    operationsPerMin: {
      type: DataTypes.DECIMAL(10, 2),
    },
    isSuspicious: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    suspicionReasons: {
      type: DataTypes.JSONB,
    },
    cpuPercent: {
      type: DataTypes.DECIMAL(5, 2),
    },
    memoryMb: {
      type: DataTypes.DECIMAL(10, 2),
    },
    networkBytesSent: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    observedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'process_events',
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = ProcessEvent;
