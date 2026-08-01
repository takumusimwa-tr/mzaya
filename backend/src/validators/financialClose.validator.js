const Joi = require('joi');

const startCloseSchema = Joi.object({
  periodId: Joi.string().uuid().required(),
}).unknown(false);

const taskParams = Joi.object({
  taskId: Joi.string().uuid().required(),
});

const closeCycleParams = Joi.object({
  closeCycleId: Joi.string().uuid().required(),
});

const snapshotParams = Joi.object({
  snapshotId: Joi.string().uuid().required(),
});

const completeTaskSchema = Joi.object({
  evidence: Joi.object().default({}),
  notes: Joi.string().trim().max(1500).allow('', null),
}).unknown(false);

const trialBalanceSchema = Joi.object({
  currency: Joi.string().uppercase().length(3).required(),
  snapshotType: Joi.string().valid(
    'pre_close',
    'adjusted',
    'final'
  ).default('pre_close'),
}).unknown(false);

module.exports = {
  startCloseSchema,
  taskParams,
  closeCycleParams,
  snapshotParams,
  completeTaskSchema,
  trialBalanceSchema,
};
