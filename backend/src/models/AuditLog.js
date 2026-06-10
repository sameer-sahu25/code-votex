const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define(
  'AuditLog',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
    },
    agentId: {
      type: DataTypes.UUID,
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    entity: {
      type: DataTypes.STRING(100),
    },
    entityId: {
      type: DataTypes.UUID,
    },
    oldValues: {
      type: DataTypes.JSONB,
    },
    newValues: {
      type: DataTypes.JSONB,
    },
    ipAddress: {
      type: DataTypes.INET,
    },
    userAgent: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = AuditLog;
