const Joi = require('joi');

module.exports = {
  changeListQuery: Joi.object({
    status: Joi.string().max(30),
    limit: Joi.number().integer().min(1).max(300).default(100),
  }).unknown(false),

  createRecord: Joi.object({
    domainId: Joi.string().uuid().required(),
    recordKey: Joi.string().max(140).required(),
    displayName: Joi.string().max(220).required(),
    payload: Joi.object().required(),
    effectiveFrom: Joi.date().iso().allow(null),
    effectiveTo: Joi.date().iso().allow(null),
    sourceType: Joi.string().max(80).allow('', null),
    sourceId: Joi.string().uuid().allow(null),
  }).unknown(false),

  createChangeRequestSchema: Joi.object({
    recordId: Joi.string().uuid().allow(null),
    domainId: Joi.string().uuid().required(),
    changeType: Joi.string().valid('create', 'update', 'retire', 'reactivate').required(),
    requestedPayload: Joi.object().required(),
    reason: Joi.string().max(1500).required(),
    impactAssessment: Joi.object().default({}),
  }).unknown(false),

  changeRequestParams: Joi.object({
    changeRequestId: Joi.string().uuid().required(),
  }),

  decisionSchema: Joi.object({
    decision: Joi.string().valid('approve', 'reject').required(),
    notes: Joi.string().max(1200).allow('', null),
  }).unknown(false),

  runQualitySchema: Joi.object({
    domainId: Joi.string().uuid().allow(null),
  }).unknown(false),

  periodLockSchema: Joi.object({
    periodKey: Joi.string().max(30).required(),
    scopeType: Joi.string().valid('global', 'entity', 'ledger', 'currency', 'module').required(),
    scopeValue: Joi.string().max(160).allow('', null),
    currency: Joi.string().uppercase().length(3).allow(null),
    lockType: Joi.string().valid('soft', 'hard').required(),
    reason: Joi.string().max(1000).required(),
  }).unknown(false),

  periodLockParams: Joi.object({
    periodLockId: Joi.string().uuid().required(),
  }),
};
