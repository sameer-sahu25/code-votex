const Joi = require('joi');

const createEventSchema = Joi.object({
  filePath: Joi.string().required(),
  fileName: Joi.string().optional(),
  fileExtension: Joi.string().optional(),
  entropyScore: Joi.number().min(0).max(8).required(),
  fileSize: Joi.number().integer().optional(),
  previousScore: Joi.number().min(0).max(8).optional(),
  sampledAt: Joi.string().required(),
});

const createBatchEventsSchema = Joi.object({
  events: Joi.array().items(createEventSchema).max(100).required(),
});

module.exports = {
  createEventSchema,
  createBatchEventsSchema,
};
