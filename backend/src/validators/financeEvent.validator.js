const Joi = require('joi');

const listQuery = Joi.object({
  status: Joi.string().max(30),
  eventType: Joi.string().max(120),
  limit: Joi.number().integer().min(1).max(300).default(100),
}).unknown(false);

const ingestEvent = Joi.object({
  eventKey: Joi.string().max(140),
  eventType: Joi.string().max(120).required(),
  sourceSystem: Joi.string().max(80).required(),
  sourceEntityType: Joi.string().max(80).allow('', null),
  sourceEntityId: Joi.string().uuid().allow(null),
  sourceReference: Joi.string().max(180).allow('', null),
  occurredAt: Joi.date().iso().required(),
  currency: Joi.string().uppercase().length(3).allow(null),
  amountMinor: Joi.number().integer().allow(null),
  payload: Joi.object().required(),
  idempotencyKey: Joi.string().max(180).required(),
  metadata: Joi.object().default({}),
}).unknown(false);

const eventParams = Joi.object({
  businessEventId: Joi.string().uuid().required(),
});

const replayBody = Joi.object({
  reason: Joi.string().max(500).required(),
}).unknown(false);

const batchBody = Joi.object({
  accountingEventIds: Joi.array()
    .min(1)
    .items(Joi.string().uuid())
    .required(),
  periodKey: Joi.string().max(30).required(),
  currency: Joi.string().uppercase().length(3).required(),
}).unknown(false);

module.exports = {
  listQuery,
  ingestEvent,
  eventParams,
  replayBody,
  batchBody,
};
