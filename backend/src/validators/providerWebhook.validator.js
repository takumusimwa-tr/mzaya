const Joi = require('joi');

const providerParamsSchema = Joi.object({
  provider: Joi.string().trim().lowercase().max(40).required(),
});

const eventIdParamsSchema = Joi.object({
  eventId: Joi.string().uuid().required(),
});

const eventQuerySchema = Joi.object({
  provider: Joi.string().trim().lowercase().max(40),
  status: Joi.string().valid(
    'received',
    'processing',
    'processed',
    'failed',
    'dead_letter'
  ),
  limit: Joi.number().integer().min(1).max(200).default(50),
}).unknown(false);

const reconciliationRunsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(200).default(50),
}).unknown(false);

module.exports = {
  providerParamsSchema,
  eventIdParamsSchema,
  eventQuerySchema,
  reconciliationRunsQuerySchema,
};
