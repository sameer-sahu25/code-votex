const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Agent = sequelize.define(
  'Agent',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    agentKey: {
      type: DataTypes.UUID,
      unique: true,
      allowNull: false,
    },
    hostname: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ipAddress: {
      type: DataTypes.INET,
    },
    osType: {
      type: DataTypes.ENUM('windows', 'linux', 'macos'),
    },
    status: {
      type: DataTypes.ENUM('online', 'offline', 'isolated'),
      defaultValue: 'offline',
    },
    lastHeartbeatAt: {
      type: DataTypes.DATE,
    },
    metadata: {
      type: DataTypes.JSONB,
    },
  },
  {
    tableName: 'agents',
    timestamps: true,
  }
);

module.exports = Agent;
