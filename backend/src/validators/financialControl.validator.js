const Joi = require('joi');

module.exports = {
  request: Joi.object({
    resourceType: Joi.string().max(60).required(),
    resourceId: Joi.string().uuid().allow(null),
    action: Joi.string().max(80).required(),
    amountMinor: Joi.number().integer().allow(null),
    currency: Joi.string().uppercase().length(3).allow(null),
    requestPayload: Joi.object().default({}),
    expiresAt: Joi.date().iso().allow(null),
  }).unknown(false),
  decision: Joi.object({
    decision: Joi.string().valid('approve', 'reject').required(),
    notes: Joi.string().max(1000).allow('', null),
  }).unknown(false),
  resolve: Joi.object({
    resolutionNotes: Joi.string().max(1500).required(),
  }).unknown(false),
};
