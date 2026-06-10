const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")

const FileEvent = sequelize.define("FileEvent", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sessionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  filePath: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  fileName: DataTypes.STRING,
  fileExtension: DataTypes.STRING,
  eventType: {
    type: DataTypes.ENUM("modified", "renamed", "created", "deleted"),
    allowNull: false,
  },
  processName: DataTypes.STRING,
  processPid: DataTypes.INTEGER,
  entropyBefore: DataTypes.FLOAT,
  entropyAfter: DataTypes.FLOAT,
  fileSize: DataTypes.BIGINT,
}, {
  tableName: "file_events",
  timestamps: true,
})

module.exports = FileEvent
