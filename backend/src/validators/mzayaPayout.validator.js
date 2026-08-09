const Joi = require('joi');

module.exports = {
  listQuery: Joi.object({
    status: Joi.string().max(30),
    mzayaId: Joi.string().uuid(),
    limit: Joi.number().integer().min(1).max(300).default(100),
  }).unknown(false),

  payoutParams: Joi.object({
    payoutId: Joi.string().uuid().required(),
  }),

  createBody: Joi.object({
    mzayaId: Joi.string().uuid().required(),
    periodFrom: Joi.date().iso().allow(null),
    periodTo: Joi.date().iso().allow(null),
    currency: Joi.string().uppercase().length(3).required(),
    payoutMethod: Joi.string().max(40).allow('', null),
    dueAt: Joi.date().iso().allow(null),
    items: Joi.array().items(Joi.object({
      orderId: Joi.string().uuid().allow(null),
      orderType: Joi.string().max(40).allow('', null),
      deliveryEarningMinor: Joi.number().integer().min(0).default(0),
      tipMinor: Joi.number().integer().min(0).default(0),
      incentiveMinor: Joi.number().integer().min(0).default(0),
      reimbursementMinor: Joi.number().integer().min(0).default(0),
      penaltyMinor: Joi.number().integer().min(0).default(0),
      withholdingMinor: Joi.number().integer().min(0).default(0),
      adjustmentMinor: Joi.number().integer().default(0),
    })).default([]),
  }).unknown(false),

  markPaidBody: Joi.object({
    amountPaidMinor: Joi.number().integer().min(1).required(),
    provider: Joi.string().max(60).allow('', null),
    providerReference: Joi.string().max(180).allow('', null),
  }).unknown(false),
};
