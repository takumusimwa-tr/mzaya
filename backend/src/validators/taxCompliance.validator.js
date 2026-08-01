const Joi = require('joi');

const jurisdictionParamsSchema = Joi.object({
  jurisdictionId: Joi.string().uuid().required(),
});

const periodParamsSchema = Joi.object({
  periodId: Joi.string().uuid().required(),
});

const taxSummaryQuerySchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
}).unknown(false);

const createInvoiceSchema = Joi.object({
  jurisdictionId: Joi.string().uuid().required(),
  orderId: Joi.string().uuid().allow(null),
  paymentId: Joi.string().uuid().allow(null),
  customerId: Joi.string().uuid().allow(null),
  currency: Joi.string().uppercase().length(3).required(),
  subtotalMinor: Joi.number().integer().min(0).required(),
  taxableMinor: Joi.number().integer().min(0).required(),
  documentType: Joi.string().valid('invoice', 'credit_note').default('invoice'),
  metadata: Joi.object().default({}),
}).unknown(false);

const periodActionSchema = Joi.object({
  notes: Joi.string().trim().max(1000).allow('', null),
}).unknown(false);

module.exports = {
  jurisdictionParamsSchema,
  periodParamsSchema,
  taxSummaryQuerySchema,
  createInvoiceSchema,
  periodActionSchema,
};
