const Joi = require('joi');

module.exports = {
  listQuery: Joi.object({
    status: Joi.string().max(30),
    limit: Joi.number().integer().min(1).max(300).default(100),
  }).unknown(false),

  transferParams: Joi.object({
    transferId: Joi.string().uuid().required(),
  }),

  createTransfer: Joi.object({
    transferType: Joi.string()
      .valid('vendor_payout', 'mzaya_payout', 'refund', 'internal_transfer', 'tax_payment', 'other')
      .required(),
    sourceAccountId: Joi.string().uuid().allow(null),
    destinationAccountId: Joi.string().uuid().allow(null),
    currency: Joi.string().uppercase().length(3).required(),
    amountMinor: Joi.number().integer().min(1).required(),
    provider: Joi.string().max(60).allow('', null),
    metadata: Joi.object().default({}),
  }).unknown(false),

  completeTransfer: Joi.object({
    providerReference: Joi.string().max(180).required(),
  }).unknown(false),
};
