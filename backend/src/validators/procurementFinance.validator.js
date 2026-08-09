const Joi = require('joi');

module.exports = {
  listQuery: Joi.object({
    status: Joi.string().max(30),
    limit: Joi.number().integer().min(1).max(300).default(100),
  }).unknown(false),

  procurementParams: Joi.object({
    procurementId: Joi.string().uuid().required(),
  }),

  createBody: Joi.object({
    customerId: Joi.string().uuid().allow(null),
    vendorId: Joi.string().uuid().allow(null),
    orderId: Joi.string().uuid().allow(null),
    orderType: Joi.string().max(40).allow('', null),
    currency: Joi.string().uppercase().length(3).required(),
    amountAuthorizedMinor: Joi.number().integer().min(0).default(0),
    procurementFeeMinor: Joi.number().integer().min(0).default(0),
    deliveryFeeMinor: Joi.number().integer().min(0).default(0),
    reimbursementMinor: Joi.number().integer().min(0).default(0),
    items: Joi.array().items(Joi.object({
      itemReference: Joi.string().max(140).allow('', null),
      description: Joi.string().max(300).allow('', null),
      quantity: Joi.number().positive().default(1),
      unitCostMinor: Joi.number().integer().min(0).default(0),
      totalCostMinor: Joi.number().integer().min(0).required(),
      vendorId: Joi.string().uuid().allow(null),
      taxMinor: Joi.number().integer().min(0).default(0),
      discountMinor: Joi.number().integer().min(0).default(0),
      metadata: Joi.object().default({}),
    })).default([]),
  }).unknown(false),
};
