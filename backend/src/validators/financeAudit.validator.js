const Joi = require('joi');

const listQuery = Joi.object({
  status: Joi.string().max(30),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical'),
  limit: Joi.number().integer().min(1).max(300).default(100),
}).unknown(false);

const createPlan = Joi.object({
  name: Joi.string().max(180).required(),
  fiscalYear: Joi.number().integer().min(2020).max(2100).required(),
  planningMethod: Joi.string().valid('risk_based', 'cycle_based', 'regulatory').required(),
  riskUniverse: Joi.array().items(Joi.object()).default([]),
}).unknown(false);

const createEngagement = Joi.object({
  auditPlanId: Joi.string().uuid().allow(null),
  name: Joi.string().max(180).required(),
  scopeType: Joi.string().valid('entity', 'process', 'module', 'period', 'thematic').required(),
  scopeValue: Joi.string().max(180).allow('', null),
  periodFrom: Joi.date().iso().required(),
  periodTo: Joi.date().iso().min(Joi.ref('periodFrom')).required(),
  riskRating: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
}).unknown(false);

const createAssessment = Joi.object({
  procedureId: Joi.string().uuid().allow(null),
  controlKey: Joi.string().max(120).required(),
  controlName: Joi.string().max(180).required(),
  controlArea: Joi.string().max(60).required(),
  designRating: Joi.string().valid('effective', 'partially_effective', 'ineffective', 'not_tested').required(),
  testPeriodFrom: Joi.date().iso().allow(null),
  testPeriodTo: Joi.date().iso().allow(null),
  populationSize: Joi.number().integer().min(0).allow(null),
  sampleSize: Joi.number().integer().min(0).allow(null),
  exceptionsCount: Joi.number().integer().min(0).default(0),
  conclusion: Joi.string().max(1500).allow('', null),
  metadata: Joi.object().default({}),
}).unknown(false);

const createEvidence = Joi.object({
  engagementId: Joi.string().uuid().allow(null),
  procedureId: Joi.string().uuid().allow(null),
  assessmentId: Joi.string().uuid().allow(null),
  evidenceType: Joi.string().valid('document', 'system_record', 'screenshot', 'export', 'confirmation', 'analysis').required(),
  title: Joi.string().max(220).required(),
  sourceType: Joi.string().max(60).allow('', null),
  sourceId: Joi.string().uuid().allow(null),
  storageKey: Joi.string().max(1500).allow('', null),
  contentHash: Joi.string().max(128).allow('', null),
  confidentiality: Joi.string().valid('internal', 'confidential', 'restricted').default('internal'),
  retentionUntil: Joi.date().iso().allow(null),
  metadata: Joi.object().default({}),
}).unknown(false);

const createFinding = Joi.object({
  engagementId: Joi.string().uuid().required(),
  assessmentId: Joi.string().uuid().allow(null),
  title: Joi.string().max(220).required(),
  description: Joi.string().max(2000).required(),
  rootCause: Joi.string().max(1500).allow('', null),
  impact: Joi.string().max(1500).allow('', null),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
  riskRating: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
  recurrenceKey: Joi.string().max(120).allow('', null),
  ownerId: Joi.string().uuid().allow(null),
  targetDate: Joi.date().iso().allow(null),
  metadata: Joi.object().default({}),
}).unknown(false);

const remediationParams = Joi.object({
  remediationId: Joi.string().uuid().required(),
});

const createRemediation = Joi.object({
  findingId: Joi.string().uuid().required(),
  actionTitle: Joi.string().max(220).required(),
  actionDescription: Joi.string().max(2000).allow('', null),
  ownerId: Joi.string().uuid().required(),
  dueDate: Joi.date().iso().required(),
}).unknown(false);

const completeRemediation = Joi.object({
  completionEvidence: Joi.object().default({}),
}).unknown(false);

const verifyRemediation = Joi.object({
  verificationNotes: Joi.string().max(1500).required(),
}).unknown(false);

module.exports = {
  listQuery,
  createPlan,
  createEngagement,
  createAssessment,
  createEvidence,
  createFinding,
  remediationParams,
  createRemediation,
  completeRemediation,
  verifyRemediation,
};
