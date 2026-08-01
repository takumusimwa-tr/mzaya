const Joi = require('joi');

const chargebackIdParamsSchema = Joi.object({
  chargebackId: Joi.string().uuid().required(),
});

const registerChargebackSchema = Joi.object({
  paymentId: Joi.string().uuid().required(),
  orderId: Joi.string().uuid().allow(null),
  provider: Joi.string().trim().max(40).required(),
  providerCaseReference: Joi.string().trim().max(180).required(),
  amountMinor: Joi.number().integer().min(1).required(),
  currency: Joi.string().uppercase().length(3).required(),
  reasonCode: Joi.string().trim().max(80).allow('', null),
  responseDueAt: Joi.date().iso().allow(null),
  providerPayload: Joi.object().default({}),
}).unknown(false);

const updateChargebackSchema = Joi.object({
  outcome: Joi.string().valid('under_review', 'won', 'lost').required(),
}).unknown(false);

module.exports = {
  chargebackIdParamsSchema,
  registerChargebackSchema,
  updateChargebackSchema,
};
