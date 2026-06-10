const Redis = require("ioredis")

const redis = new Redis(process.env.REDIS_URL, {
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
  lazyConnect: true,
})

redis.on("connect", () => console.log("Redis connected"))
redis.on("error", (err) => console.error("Redis error:", err))

const KEYS = {
  THREAT_SCORE: (sessionId) => `threat_score:${sessionId}`,
  MONITORING_SESSION: (userId) => `monitoring:${userId}`,
  RATE_LIMIT: (ip) => `rate_limit:${ip}`,
  CANARY_FILES: (sessionId) => `canary:${sessionId}`,
}

const EXPIRY = {
  THREAT_SCORE: 10,
  MONITORING_SESSION: 86400,
  RATE_LIMIT: 900,
}

module.exports = { redis, KEYS, EXPIRY }
