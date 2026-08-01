const Joi = require('joi');

const budgetLine = Joi.object({
  periodCode: Joi.string().max(20).required(),
  accountId: Joi.string().uuid().allow(null),
  departmentCode: Joi.string().max(60).allow('', null),
  costCenterCode: Joi.string().max(60).allow('', null),
  lineType: Joi.string().max(40).required(),
  amountMinor: Joi.number().integer().required(),
  notes: Joi.string().max(500).allow('', null),
});

const createBudget = Joi.object({
  name: Joi.string().max(180).required(),
  budgetType: Joi.string().valid(
    'annual',
    'quarterly',
    'monthly',
    'department',
    'cost_center'
  ).required(),
  currency: Joi.string().uppercase().length(3).required(),
  fiscalYear: Joi.number().integer().min(2020).max(2100).required(),
  assumptions: Joi.object().default({}),
  lines: Joi.array().min(1).items(budgetLine).required(),
}).unknown(false);

const budgetVersionParams = Joi.object({
  budgetVersionId: Joi.string().uuid().required(),
});

const forecastLine = Joi.object({
  periodCode: Joi.string().max(20).required(),
  accountId: Joi.string().uuid().allow(null),
  departmentCode: Joi.string().max(60).allow('', null),
  costCenterCode: Joi.string().max(60).allow('', null),
  lineType: Joi.string().max(40).required(),
  baseMinor: Joi.number().integer().required(),
  growthRate: Joi.number().min(-1).max(10),
  confidenceRatio: Joi.number().min(0).max(1),
  sourceType: Joi.string().max(60).allow('', null),
  sourceId: Joi.string().uuid().allow(null),
});

const createForecast = Joi.object({
  name: Joi.string().max(180).required(),
  currency: Joi.string().uppercase().length(3).required(),
  horizonMonths: Joi.number().integer().min(1).max(60).default(12),
  scenario: Joi.string().valid('base', 'upside', 'downside', 'stress').default('base'),
  assumptions: Joi.object().default({}),
  lines: Joi.array().min(1).items(forecastLine).required(),
}).unknown(false);

const createVariance = Joi.object({
  reportType: Joi.string().valid(
    'actual_vs_budget',
    'actual_vs_forecast'
  ).required(),
  currency: Joi.string().uppercase().length(3).required(),
  periodFrom: Joi.string().max(20).required(),
  periodTo: Joi.string().max(20).required(),
  budgetVersionId: Joi.string().uuid().allow(null),
  forecastVersionId: Joi.string().uuid().allow(null),
}).xor('budgetVersionId', 'forecastVersionId').unknown(false);

module.exports = {
  createBudget,
  budgetVersionParams,
  createForecast,
  createVariance,
};
