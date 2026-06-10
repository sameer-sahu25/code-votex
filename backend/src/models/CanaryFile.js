const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CanaryFile = sequelize.define(
  'CanaryFile',
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
      allowNull: false,
    },
    fileHash: {
      type: DataTypes.STRING(64),
    },
    isTriggered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    triggeredAt: {
      type: DataTypes.DATE,
    },
    triggeringProcess: {
      type: DataTypes.STRING(255),
    },
    triggeringPid: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: 'canary_files',
    timestamps: true,
  }
);

module.exports = CanaryFile;
