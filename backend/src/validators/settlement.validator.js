const Joi = require('joi');

const batchIdParamsSchema = Joi.object({
  batchId: Joi.string().uuid().required(),
});

const upsertProfileSchema = Joi.object({
  ownerType: Joi.string().valid('vendor', 'rider').required(),
  ownerId: Joi.string().uuid().required(),
  currency: Joi.string().uppercase().length(3).required(),
  payoutMethod: Joi.string().valid(
    'bank_transfer',
    'mobile_money',
    'manual'
  ).required(),
  payoutDestination: Joi.object().required(),
  minimumPayoutMinor: Joi.number().integer().min(0).default(0),
  schedule: Joi.string().valid(
    'daily',
    'weekly',
    'biweekly',
    'monthly'
  ).default('weekly'),
  holdDays: Joi.number().integer().min(0).max(90).default(0),
}).unknown(false);

const createBatchSchema = Joi.object({
  ownerType: Joi.string().valid('vendor', 'rider').required(),
  currency: Joi.string().uppercase().length(3).required(),
  settlementDate: Joi.date().iso().required(),
}).unknown(false);

const createAdjustmentSchema = Joi.object({
  ownerType: Joi.string().valid('vendor', 'rider').required(),
  ownerId: Joi.string().uuid().required(),
  currency: Joi.string().uppercase().length(3).required(),
  amountMinor: Joi.number().integer().invalid(0).required(),
  adjustmentType: Joi.string().valid(
    'bonus',
    'penalty',
    'correction',
    'refund_recovery',
    'chargeback_recovery'
  ).required(),
  reason: Joi.string().trim().max(500).required(),
  metadata: Joi.object().default({}),
}).unknown(false);

module.exports = {
  batchIdParamsSchema,
  upsertProfileSchema,
  createBatchSchema,
  createAdjustmentSchema,
};
