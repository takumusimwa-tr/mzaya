const Joi = require('joi');

const listQuery = Joi.object({
  baseCurrency: Joi.string().uppercase().length(3),
  limit: Joi.number().integer().min(1).max(300).default(100),
}).unknown(false);

const createTransfer = Joi.object({
  fromBankAccountId: Joi.string().uuid().required(),
  toBankAccountId: Joi.string().uuid().required(),
  sourceAmountMinor: Joi.number().integer().min(1).required(),
  transferType: Joi.string().valid(
    'internal',
    'cash_pool',
    'fx_conversion'
  ).default('internal'),
}).unknown(false);

const cashPoolParams = Joi.object({
  cashPoolId: Joi.string().uuid().required(),
});

module.exports = {
  listQuery,
  createTransfer,
  cashPoolParams,
};
