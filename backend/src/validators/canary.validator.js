const Joi = require('joi');

const registerCanaryFileSchema = Joi.object({
  filePath: Joi.string().required(),
  fileName: Joi.string().required(),
  fileHash: Joi.string().optional(),
});

const createCanaryAlertSchema = Joi.object({
  canaryFileId: Joi.string().uuid().required(),
  processName: Joi.string().optional(),
  processPid: Joi.number().integer().optional(),
  accessType: Joi.string().valid('read', 'write', 'rename', 'delete', 'encrypt').optional(),
  rawEventData: Joi.object().optional(),
});

const bulkAcknowledgeSchema = Joi.object({
  alertIds: Joi.array().items(Joi.string().uuid()).required(),
});

module.exports = {
  registerCanaryFileSchema,
  createCanaryAlertSchema,
  bulkAcknowledgeSchema,
};
