const Joi = require('joi');

const disputeIdParamsSchema = Joi.object({
  disputeId: Joi.string().uuid().required(),
});

const createDisputeSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
  paymentId: Joi.string().uuid().allow(null),
  category: Joi.string().valid(
    'delivery',
    'quality',
    'payment',
    'missing_item',
    'vendor',
    'safety',
    'other'
  ).required(),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
  subject: Joi.string().trim().max(180).required(),
  statement: Joi.string().trim().max(5000).required(),
}).unknown(false);

const evidenceSchema = Joi.object({
  evidenceType: Joi.string().valid(
    'photo',
    'document',
    'receipt',
    'chat',
    'delivery_proof',
    'other'
  ).required(),
  attachmentId: Joi.string().uuid().allow(null),
  notes: Joi.string().trim().max(1000).allow('', null),
}).unknown(false);

const updateDisputeSchema = Joi.object({
  status: Joi.string().valid(
    'open',
    'awaiting_vendor',
    'under_review',
    'resolved',
    'closed'
  ),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent'),
  assigned_agent_id: Joi.string().uuid().allow(null),
  vendor_response: Joi.string().trim().max(5000).allow('', null),
  resolution: Joi.string().max(80).allow('', null),
  resolution_notes: Joi.string().trim().max(5000).allow('', null),
}).min(1).unknown(false);

module.exports = {
  disputeIdParamsSchema,
  createDisputeSchema,
  evidenceSchema,
  updateDisputeSchema,
};
