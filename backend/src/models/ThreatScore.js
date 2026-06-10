const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ThreatScore = sequelize.define(
  'ThreatScore',
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
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    verdict: {
      type: DataTypes.ENUM('safe', 'suspicious', 'dangerous', 'ransomware'),
      allowNull: false,
    },
    canaryScore: {
      type: DataTypes.INTEGER,
    },
    entropyScore: {
      type: DataTypes.INTEGER,
    },
    processScore: {
      type: DataTypes.INTEGER,
    },
    canaryWeight: {
      type: DataTypes.DECIMAL(3, 2),
    },
    entropyWeight: {
      type: DataTypes.DECIMAL(3, 2),
    },
    processWeight: {
      type: DataTypes.DECIMAL(3, 2),
    },
    activeCanaryAlerts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    activeEntropyAnomalies: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    activeSuspiciousProcs: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    triggerDetails: {
      type: DataTypes.JSONB,
    },
    calculatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'threat_scores',
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = ThreatScore;
