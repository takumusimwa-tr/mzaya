const Joi = require('joi');

const dashboardQuery = Joi.object({
  currency: Joi.string().uppercase().length(3).required(),
  from: Joi.date().iso().required(),
  to: Joi.date().iso().min(Joi.ref('from')).required(),
}).unknown(false);

const listQuery = Joi.object({
  limit: Joi.number().integer().min(1).max(500).default(200),
}).unknown(false);

const snapshotBody = Joi.object({
  kpiKey: Joi.string().max(100).required(),
  snapshotDate: Joi.date().iso().required(),
  periodType: Joi.string().valid('daily', 'weekly', 'monthly', 'quarterly', 'annual').required(),
  periodKey: Joi.string().max(30).required(),
  currency: Joi.string().uppercase().length(3).allow(null),
  dimensionType: Joi.string().max(40).allow('', null),
  dimensionValue: Joi.string().max(160).allow('', null),
  value: Joi.number().required(),
  sourceLineage: Joi.array().items(Joi.object()).default([]),
  metadata: Joi.object().default({}),
}).unknown(false);

const kpiParams = Joi.object({
  kpiKey: Joi.string().max(100).required(),
});

const trendQuery = Joi.object({
  from: Joi.date().iso().required(),
  to: Joi.date().iso().min(Joi.ref('from')).required(),
  currency: Joi.string().uppercase().length(3).allow(null),
}).unknown(false);

const reportingPackBody = Joi.object({
  packType: Joi.string().valid('management', 'board', 'investor', 'weekly').required(),
  title: Joi.string().max(220).required(),
  periodFrom: Joi.date().iso().required(),
  periodTo: Joi.date().iso().min(Joi.ref('periodFrom')).required(),
  currency: Joi.string().uppercase().length(3).required(),
}).unknown(false);

module.exports = {
  dashboardQuery,
  listQuery,
  snapshotBody,
  kpiParams,
  trendQuery,
  reportingPackBody,
};
