const Joi = require('joi');

const dashboardQuerySchema = Joi.object({
  currency: Joi.string().uppercase().length(3).default('USD'),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
}).unknown(false);

const exportJobSchema = Joi.object({
  exportType: Joi.string().valid(
    'dashboard',
    'ledger',
    'settlements',
    'refunds',
    'reconciliation'
  ).required(),
  format: Joi.string().valid('csv', 'xlsx', 'pdf').required(),
  filters: Joi.object({
    currency: Joi.string().uppercase().length(3).required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().required(),
  }).required(),
}).unknown(false);

const exportJobParamsSchema = Joi.object({
  jobId: Joi.string().uuid().required(),
});

module.exports = {
  dashboardQuerySchema,
  exportJobSchema,
  exportJobParamsSchema,
};
