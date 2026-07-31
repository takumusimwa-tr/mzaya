const Joi = require('joi');

const refundIdParamsSchema = Joi.object({
  refundId: Joi.string().uuid().required(),
});

const requestRefundSchema = Joi.object({
  paymentId: Joi.string().uuid().required(),
  amountMinor: Joi.number().integer().min(1).required(),
  reason: Joi.string().valid(
    'customer_request',
    'item_unavailable',
    'delivery_failure',
    'duplicate_payment',
    'quality_issue',
    'other'
  ).required(),
  notes: Joi.string().trim().max(1000).allow('', null),
}).unknown(false);

const approveRefundSchema = Joi.object({
  notes: Joi.string().trim().max(1000).allow('', null),
}).unknown(false);

const completeRefundSchema = Joi.object({
  provider: Joi.string().trim().max(40).required(),
  providerReference: Joi.string().trim().max(180).required(),
  providerPayload: Joi.object().default({}),
  allocations: Joi.object({
    vendorMinor: Joi.number().integer().min(0).required(),
    mzayaMinor: Joi.number().integer().min(0).required(),
    platformMinor: Joi.number().integer().min(0).required(),
  }).required(),
}).unknown(false);

module.exports = {
  refundIdParamsSchema,
  requestRefundSchema,
  approveRefundSchema,
  completeRefundSchema,
};
