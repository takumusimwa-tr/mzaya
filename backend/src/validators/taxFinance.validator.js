const Joi = require('joi');

module.exports = {
  listQuery: Joi.object({
    limit: Joi.number().integer().min(1).max(300).default(100),
  }).unknown(false),

  taxTransactionParams: Joi.object({
    taxTransactionId: Joi.string().uuid().required(),
  }),

  remittanceParams: Joi.object({
    remittanceId: Joi.string().uuid().required(),
  }),

  createTaxTransaction: Joi.object({
    sourceType: Joi.string().max(60).required(),
    sourceId: Joi.string().uuid().allow(null),
    sourceEventType: Joi.string().max(120).allow('', null),
    jurisdictionCode: Joi.string().max(40).allow('', null),
    taxCode: Joi.string().max(80).required(),
    taxType: Joi.string().max(60).required(),
    currency: Joi.string().uppercase().length(3).required(),
    taxableBaseMinor: Joi.number().integer().min(0).required(),
    taxRateBps: Joi.number().integer().min(0).required(),
    taxInclusive: Joi.boolean().default(false),
    direction: Joi.string().valid('payable', 'receivable').default('payable'),
    metadata: Joi.object().default({}),
  }).unknown(false),

  reverseBody: Joi.object({
    reason: Joi.string().max(800).required(),
  }).unknown(false),

  refreshLiability: Joi.object({
    jurisdictionCode: Joi.string().max(40).allow('', null),
    taxCode: Joi.string().max(80).required(),
    taxType: Joi.string().max(60).required(),
    periodKey: Joi.string().max(30).required(),
    currency: Joi.string().uppercase().length(3).required(),
  }).unknown(false),

  createRemittance: Joi.object({
    liabilityId: Joi.string().uuid().required(),
    amountMinor: Joi.number().integer().min(1).required(),
    sourceAccountId: Joi.string().uuid().required(),
    provider: Joi.string().max(60).allow('', null),
  }).unknown(false),

  paidRemittance: Joi.object({
    providerReference: Joi.string().max(180).required(),
  }).unknown(false),
};
