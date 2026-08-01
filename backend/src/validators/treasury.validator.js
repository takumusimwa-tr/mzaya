const Joi = require('joi');

const liquidityQuery = Joi.object({
  currency: Joi.string().uppercase().length(3).required(),
}).unknown(false);

const trendQuery = Joi.object({
  currency: Joi.string().uppercase().length(3).required(),
  limit: Joi.number().integer().min(1).max(365).default(60),
}).unknown(false);

const reconciliationParams = Joi.object({
  bankTransactionId: Joi.string().uuid().required(),
});

const reconciliationBody = Joi.object({
  ledgerTransactionId: Joi.string().uuid().required(),
  notes: Joi.string().trim().max(1000).allow('', null),
}).unknown(false);

const paymentBatchBody = Joi.object({
  items: Joi.array().min(1).items(Joi.object({
    beneficiaryType: Joi.string().max(40).required(),
    beneficiaryId: Joi.string().uuid().allow(null),
    beneficiaryName: Joi.string().max(180).required(),
    destinationToken: Joi.string().max(255).allow('', null),
    amountMinor: Joi.number().integer().min(1).required(),
    currency: Joi.string().uppercase().length(3).required(),
    purpose: Joi.string().max(180).allow('', null),
    sourceType: Joi.string().max(60).allow('', null),
    sourceId: Joi.string().uuid().allow(null),
  })).required(),
}).unknown(false);

module.exports = {
  liquidityQuery,
  trendQuery,
  reconciliationParams,
  reconciliationBody,
  paymentBatchBody,
};
