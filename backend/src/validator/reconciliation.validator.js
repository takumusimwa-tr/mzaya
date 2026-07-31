const Joi = require('joi');

const ingestReconciliationSchema = Joi.object({
  provider: Joi.string().trim().max(40).required(),
  providerReference: Joi.string().trim().max(180).required(),
  internalReference: Joi.string().trim().max(180).allow(null, ''),
  recordType: Joi.string().valid(
    'payment',
    'refund',
    'chargeback',
    'settlement'
  ).required(),
  currency: Joi.string().uppercase().length(3).required(),
  providerAmountMinor: Joi.number().integer().min(0).required(),
  providerPayload: Joi.object().default({}),
}).unknown(false);

const reconciliationQuerySchema = Joi.object({
  status: Joi.string().pattern(/^[a-z_,]+$/),
  limit: Joi.number().integer().min(1).max(200).default(50),
}).unknown(false);

module.exports = {
  ingestReconciliationSchema,
  reconciliationQuerySchema,
};
