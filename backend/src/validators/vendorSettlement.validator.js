const Joi = require('joi');

module.exports = {
  listQuery: Joi.object({
    status: Joi.string().max(30),
    vendorId: Joi.string().uuid(),
    limit: Joi.number().integer().min(1).max(300).default(100),
  }).unknown(false),

  settlementParams: Joi.object({
    settlementId: Joi.string().uuid().required(),
  }),

  createBody: Joi.object({
    vendorId: Joi.string().uuid().required(),
    periodFrom: Joi.date().iso().allow(null),
    periodTo: Joi.date().iso().allow(null),
    currency: Joi.string().uppercase().length(3).required(),
    dueAt: Joi.date().iso().allow(null),
    items: Joi.array().items(Joi.object({
      orderId: Joi.string().uuid().allow(null),
      orderType: Joi.string().max(40).allow('', null),
      grossMinor: Joi.number().integer().min(0).required(),
      refundMinor: Joi.number().integer().min(0).default(0),
      discountMinor: Joi.number().integer().min(0).default(0),
      commissionMinor: Joi.number().integer().min(0).default(0),
      platformFeeMinor: Joi.number().integer().min(0).default(0),
      taxWithheldMinor: Joi.number().integer().min(0).default(0),
      adjustmentMinor: Joi.number().integer().default(0),
    })).default([]),
  }).unknown(false),

  markPaidBody: Joi.object({
    amountPaidMinor: Joi.number().integer().min(1).required(),
    provider: Joi.string().max(60).allow('', null),
    providerReference: Joi.string().max(180).allow('', null),
  }).unknown(false),
};
