const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EntropyEvent = sequelize.define(
  'EntropyEvent',
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
    filePath: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING(255),
    },
    fileExtension: {
      type: DataTypes.STRING(32),
    },
    entropyScore: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.BIGINT,
    },
    previousScore: {
      type: DataTypes.DECIMAL(5, 4),
    },
    scoreDelta: {
      type: DataTypes.DECIMAL(5, 4),
    },
    isAnomaly: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    anomalyReason: {
      type: DataTypes.STRING(500),
    },
    sampledAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'entropy_events',
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = EntropyEvent;
