const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")

const MonitoringSession = sequelize.define("MonitoringSession", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("active", "stopped", "attack_detected"),
    defaultValue: "active",
  },
  watchDirectories: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: [],
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  endedAt: DataTypes.DATE,
  totalFilesMonitored: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalAlertsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  attackStopped: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "monitoring_sessions",
  timestamps: true,
})

module.exports = MonitoringSession
