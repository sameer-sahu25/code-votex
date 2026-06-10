module.exports = {
  ENTROPY: {
    MAX_SCORE: 8.0,
    ANOMALY_THRESHOLD: 7.2,
    DELTA_THRESHOLD: 2.5,
  },
  THREAT: {
    WEIGHTS: {
      CANARY: 0.45,
      ENTROPY: 0.30,
      PROCESS: 0.25,
    },
    VERDICT: {
      SAFE: { min: 0, max: 29 },
      SUSPICIOUS: { min: 30, max: 59 },
      DANGEROUS: { min: 60, max: 79 },
      RANSOMWARE: { min: 80, max: 100 },
    },
  },
  PROCESS: {
    OPS_PER_MIN_THRESHOLD: 500,
  },
  JOBS: {
    THREAT_EVALUATOR_INTERVAL: 10000,
    CLEANUP_INTERVAL: 86400000,
  },
  DB: {
    EVENT_RETENTION_DAYS: 30,
  },
  JWT: {
    ACCESS_EXPIRY: '15m',
    REFRESH_EXPIRY: '7d',
  },
};
