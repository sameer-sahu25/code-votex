const { Sequelize } = require("sequelize")
const logger = require("./logger")

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: process.env.NODE_ENV === "development" ? (msg) => logger.debug(msg) : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
})

const connectDB = async () => {
  try {
    await sequelize.authenticate()
    logger.info("PostgreSQL connected successfully")
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true })
      logger.info("All models synchronized")
    }
  } catch (error) {
    logger.error("Database connection failed:", error)
    process.exit(1)
  }
}

module.exports = { sequelize, connectDB }
