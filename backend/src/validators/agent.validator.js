const Joi = require('joi');

const createAgentSchema = Joi.object({
  hostname: Joi.string().required(),
  osType: Joi.string().valid('windows', 'linux', 'macos').required(),
  metadata: Joi.object().optional(),
});

const updateAgentSchema = Joi.object({
  status: Joi.string().valid('online', 'offline', 'isolated').optional(),
  metadata: Joi.object().optional(),
});

module.exports = {
  createAgentSchema,
  updateAgentSchema,
};
