const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const KillSwitchLog = sequelize.define(
  'KillSwitchLog',
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
    triggeredBy: {
      type: DataTypes.ENUM('auto', 'manual'),
      allowNull: false,
    },
    triggeredByUserId: {
      type: DataTypes.UUID,
    },
    threatScoreAtTrigger: {
      type: DataTypes.INTEGER,
    },
    action: {
      type: DataTypes.ENUM('network_disabled', 'network_restored', 'process_killed', 'isolated'),
      allowNull: false,
    },
    commandIssued: {
      type: DataTypes.TEXT,
    },
    commandOutput: {
      type: DataTypes.TEXT,
    },
    success: {
      type: DataTypes.BOOLEAN,
    },
    errorMessage: {
      type: DataTypes.TEXT,
    },
    executedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'kill_switch_logs',
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = KillSwitchLog;
