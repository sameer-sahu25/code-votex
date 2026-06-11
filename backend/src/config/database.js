const { Sequelize } = require("sequelize")
const logger = require("./logger")

const isLocalhost = process.env.DATABASE_URL && (
  process.env.DATABASE_URL.includes("localhost") ||
  process.env.DATABASE_URL.includes("127.0.0.1") ||
  process.env.DATABASE_URL.includes("host.docker.internal") ||
  process.env.DATABASE_URL.includes("@db:") ||
  process.env.DATABASE_URL.includes("@postgres:") ||
  process.env.DATABASE_URL.includes("://db:") ||
  process.env.DATABASE_URL.includes("://postgres:")
);

const dialectOptions = {};
// Only enable SSL if explicitly requested or in production on a non-local host, unless DB_SSL is explicitly false
if (process.env.DB_SSL === "true" || (process.env.NODE_ENV === "production" && !isLocalhost && process.env.DB_SSL !== "false")) {
  dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false,
  };
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions,
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
