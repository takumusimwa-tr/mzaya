const Joi = require('joi');

const participantSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  role: Joi.string().valid(
    'customer',
    'vendor',
    'rider',
    'support',
    'admin',
    'member'
  ).required(),
});

const createConversationSchema = Joi.object({
  type: Joi.string().valid(
    'order',
    'support',
    'vendor',
    'direct'
  ).default('order'),
  orderId: Joi.string().uuid().allow(null),
  title: Joi.string().trim().max(160).allow(null, ''),
  metadata: Joi.object().default({}),
  participants: Joi.array()
    .items(participantSchema)
    .min(1)
    .max(20)
    .required(),
}).unknown(false);

const conversationIdParamsSchema = Joi.object({
  conversationId: Joi.string().uuid().required(),
});

const listQuerySchema = Joi.object({
  cursor: Joi.date().iso(),
  limit: Joi.number().integer().min(1).max(100).default(30),
}).unknown(false);

const createMessageSchema = Joi.object({
  clientMessageId: Joi.string().trim().max(100).allow(null, ''),
  type: Joi.string().valid(
    'text',
    'system',
    'image',
    'location',
    'file'
  ).default('text'),
  body: Joi.string().trim().max(5000).allow(null, ''),
  metadata: Joi.object().default({}),
  replyToMessageId: Joi.string().uuid().allow(null),
}).unknown(false);

const markReadSchema = Joi.object({
  messageId: Joi.string().uuid().required(),
}).unknown(false);

module.exports = {
  createConversationSchema,
  conversationIdParamsSchema,
  listQuerySchema,
  createMessageSchema,
  markReadSchema,
};
