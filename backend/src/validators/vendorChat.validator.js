const Joi = require('joi');

const orderIdParamsSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
});

const quickReplyIdParamsSchema = Joi.object({
  quickReplyId: Joi.string().uuid().required(),
});

const listQuerySchema = Joi.object({
  cursor: Joi.date().iso(),
  limit: Joi.number().integer().min(1).max(100).default(30),
}).unknown(false);

const ensureConversationSchema = Joi.object({
  includeMzaya: Joi.boolean().default(true),
}).unknown(false);

const quickReplyCreateSchema = Joi.object({
  label: Joi.string().trim().max(120).required(),
  message: Joi.string().trim().max(1000).required(),
  category: Joi.string().valid(
    'general',
    'preparation',
    'pickup',
    'availability',
    'delay'
  ).default('general'),
  sortOrder: Joi.number().integer().min(0).max(1000).default(0),
}).unknown(false);

const quickReplyUpdateSchema = Joi.object({
  label: Joi.string().trim().max(120),
  message: Joi.string().trim().max(1000),
  category: Joi.string().valid(
    'general',
    'preparation',
    'pickup',
    'availability',
    'delay'
  ),
  sort_order: Joi.number().integer().min(0).max(1000),
}).min(1).unknown(false);

const quickReplySendSchema = Joi.object({
  conversationId: Joi.string().uuid().required(),
  clientMessageId: Joi.string().trim().max(100).required(),
}).unknown(false);

module.exports = {
  orderIdParamsSchema,
  quickReplyIdParamsSchema,
  listQuerySchema,
  ensureConversationSchema,
  quickReplyCreateSchema,
  quickReplyUpdateSchema,
  quickReplySendSchema,
};
