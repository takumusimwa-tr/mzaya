const Joi = require('joi');

const taxReturnParamsSchema = Joi.object({
  taxReturnId: Joi.string().uuid().required(),
});

const upsertRegistrationSchema = Joi.object({
  jurisdictionId: Joi.string().uuid().required(),
  registrationType: Joi.string().valid(
    'vat',
    'income_tax',
    'withholding_tax',
    'other'
  ).required(),
  registrationNumber: Joi.string().trim().max(120).required(),
  legalName: Joi.string().trim().max(180).required(),
  effectiveFrom: Joi.date().iso().required(),
  effectiveTo: Joi.date().iso().min(Joi.ref('effectiveFrom')).allow(null),
}).unknown(false);

const prepareReturnSchema = Joi.object({
  filingPeriodId: Joi.string().uuid().required(),
  registrationId: Joi.string().uuid().required(),
  adjustmentsMinor: Joi.number().integer().default(0),
}).unknown(false);

const submitReturnSchema = Joi.object({
  submissionReference: Joi.string().trim().max(180).required(),
}).unknown(false);

const returnsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(300).default(100),
}).unknown(false);

module.exports = {
  taxReturnParamsSchema,
  upsertRegistrationSchema,
  prepareReturnSchema,
  submitReturnSchema,
  returnsQuerySchema,
};
