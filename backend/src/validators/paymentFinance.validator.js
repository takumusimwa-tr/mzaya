const Joi = require('joi');

module.exports = {
  listQuery: Joi.object({
    limit: Joi.number().integer().min(1).max(300).default(100),
  }).unknown(false),

  paymentParams: Joi.object({
    paymentId: Joi.string().uuid().required(),
  }),

  refundParams: Joi.object({
    refundId: Joi.string().uuid().required(),
  }),

  refundBody: Joi.object({
    amountMinor: Joi.number().integer().min(1).required(),
    reason: Joi.string().max(500).allow('', null),
  }).unknown(false),

  completeRefundBody: Joi.object({
    providerRefundReference: Joi.string().max(180).allow('', null),
  }).unknown(false),
};
