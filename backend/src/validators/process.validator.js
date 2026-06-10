const Joi = require('joi');

const createEventSchema = Joi.object({
  processName: Joi.string().required(),
  processPid: Joi.number().integer().required(),
  parentPid: Joi.number().integer().optional(),
  executablePath: Joi.string().optional(),
  filesOpenedCount: Joi.number().integer().optional(),
  filesReadCount: Joi.number().integer().optional(),
  filesWrittenCount: Joi.number().integer().optional(),
  filesRenamedCount: Joi.number().integer().optional(),
  filesDeletedCount: Joi.number().integer().optional(),
  cpuPercent: Joi.number().optional(),
  memoryMb: Joi.number().optional(),
  networkBytesSent: Joi.number().integer().optional(),
  observedAt: Joi.string().required(),
});

module.exports = {
  createEventSchema,
};
