const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")

const Settings = sequelize.define("Settings", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    unique: true,
    allowNull: false,
  },
  watchDirectories: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: [],
  },
  entropyThreshold: {
    type: DataTypes.FLOAT,
    defaultValue: 7.0,
  },
  threatScoreThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 80,
  },
  filesPerMinThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 200,
  },
  autoKillSwitch: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  emailAlerts: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  alertEmail: DataTypes.STRING,
  canaryFilesPerDir: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  autoStartMonitoring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "settings",
  timestamps: true,
})

module.exports = Settings
