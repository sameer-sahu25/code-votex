const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")

const Alert = sequelize.define("Alert", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sessionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("critical", "warning", "info"),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  processName: DataTypes.STRING,
  processPid: DataTypes.INTEGER,
  filePath: DataTypes.TEXT,
  entropyScore: DataTypes.FLOAT,
  threatScore: {
    type: DataTypes.INTEGER,
    validate: { min: 0, max: 100 },
  },
  networkAction: {
    type: DataTypes.ENUM("none", "isolated", "restored"),
    defaultValue: "none",
  },
  isCanaryAlert: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  acknowledged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  acknowledgedAt: DataTypes.DATE,
}, {
  tableName: "alerts",
  timestamps: true,
})

module.exports = Alert
