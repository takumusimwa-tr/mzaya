const Joi = require('joi');

const listQuery = Joi.object({
  limit: Joi.number().integer().min(1).max(300).default(100),
}).unknown(false);

const startConsolidation = Joi.object({
  consolidationGroupId: Joi.string().uuid().required(),
  periodCode: Joi.string().trim().max(20).required(),
}).unknown(false);

const transactionParams = Joi.object({
  transactionId: Joi.string().uuid().required(),
});

const createIntercompany = Joi.object({
  sourceEntityId: Joi.string().uuid().required(),
  counterpartyEntityId: Joi.string().uuid().required(),
  transactionType: Joi.string().valid(
    'service',
    'loan',
    'transfer',
    'receivable',
    'payable',
    'other'
  ).required(),
  sourceTransactionId: Joi.string().uuid().allow(null),
  counterpartyTransactionId: Joi.string().uuid().allow(null),
  currency: Joi.string().uppercase().length(3).required(),
  amountMinor: Joi.number().integer().min(1).required(),
  transactionDate: Joi.date().iso().required(),
  metadata: Joi.object().default({}),
}).unknown(false);

const reconcileIntercompany = Joi.object({
  counterpartyTransactionId: Joi.string().uuid().required(),
}).unknown(false);

module.exports = {
  listQuery,
  startConsolidation,
  transactionParams,
  createIntercompany,
  reconcileIntercompany,
};
