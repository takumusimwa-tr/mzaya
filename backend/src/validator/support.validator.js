const Joi = require('joi');

const ticketIdParamsSchema = Joi.object({
  ticketId: Joi.string().uuid().required(),
});

const createTicketSchema = Joi.object({
  subject: Joi.string().trim().max(180).required(),
  category: Joi.string().valid(
    'general',
    'order',
    'payment',
    'delivery',
    'vendor',
    'account',
    'safety'
  ).default('general'),
  priority: Joi.string().valid(
    'low',
    'normal',
    'high',
    'urgent'
  ).default('normal'),
  orderId: Joi.string().uuid().allow(null),
  body: Joi.string().trim().max(5000).required(),
  metadata: Joi.object().default({}),
}).unknown(false);

const listQueueSchema = Joi.object({
  status: Joi.string().valid(
    'open',
    'in_progress',
    'waiting_customer',
    'waiting_internal',
    'resolved',
    'closed'
  ),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent'),
  assignedAgentId: Joi.string().uuid(),
  cursor: Joi.date().iso(),
  limit: Joi.number().integer().min(1).max(100).default(30),
}).unknown(false);

const assignTicketSchema = Joi.object({
  agentId: Joi.string().uuid().required(),
}).unknown(false);

const updateTicketSchema = Joi.object({
  status: Joi.string().valid(
    'open',
    'in_progress',
    'waiting_customer',
    'waiting_internal',
    'resolved',
    'closed'
  ),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent'),
  category: Joi.string().valid(
    'general',
    'order',
    'payment',
    'delivery',
    'vendor',
    'account',
    'safety'
  ),
  resolutionSummary: Joi.string().trim().max(3000).allow(null, ''),
}).min(1).unknown(false);

const internalNoteSchema = Joi.object({
  body: Joi.string().trim().max(5000).required(),
  metadata: Joi.object().default({}),
}).unknown(false);

module.exports = {
  ticketIdParamsSchema,
  createTicketSchema,
  listQueueSchema,
  assignTicketSchema,
  updateTicketSchema,
  internalNoteSchema,
};
