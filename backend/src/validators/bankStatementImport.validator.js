const Joi = require('joi');

const createImportSchema = Joi.object({
  bankAccountId: Joi.string().uuid().required(),
  sourceFormat: Joi.string().valid('csv', 'xlsx', 'json', 'api').required(),
  sourceStorageKey: Joi.string().max(1000).allow('', null),
  rows: Joi.array().min(1).max(10000).items(
    Joi.object().unknown(true)
  ).required(),
}).unknown(false);

const importQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(300).default(100),
}).unknown(false);

const bankTransactionParamsSchema = Joi.object({
  bankTransactionId: Joi.string().uuid().required(),
});

const candidateParamsSchema = Joi.object({
  candidateId: Joi.string().uuid().required(),
});

const candidateDecisionSchema = Joi.object({
  notes: Joi.string().trim().max(1000).allow('', null),
}).unknown(false);

module.exports = {
  createImportSchema,
  importQuerySchema,
  bankTransactionParamsSchema,
  candidateParamsSchema,
  candidateDecisionSchema,
};
