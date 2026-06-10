const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")

const Process = sequelize.define("Process", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sessionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  processName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pid: DataTypes.INTEGER,
  filesPerMin: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  renameRate: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  totalFilesAccessed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  threatScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0, max: 100 },
  },
  status: {
    type: DataTypes.ENUM("safe", "suspicious", "critical"),
    defaultValue: "safe",
  },
  lastSeen: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  cpuUsage: DataTypes.FLOAT,
  memoryUsage: DataTypes.FLOAT,
}, {
  tableName: "processes",
  timestamps: true,
})

module.exports = Process
