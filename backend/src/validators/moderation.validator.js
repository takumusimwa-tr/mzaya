const Joi = require('joi');

const id = Joi.string().uuid().required();

const createReportSchema = Joi.object({
  reason: Joi.string().valid(
    'harassment', 'spam', 'fraud', 'unsafe_content',
    'personal_information', 'other'
  ).required(),
  details: Joi.string().trim().max(1000).allow('', null),
}).unknown(false);

const listReportsSchema = Joi.object({
  status: Joi.string().valid('open', 'reviewing', 'resolved', 'dismissed'),
  reason: Joi.string().valid(
    'harassment', 'spam', 'fraud', 'unsafe_content',
    'personal_information', 'other'
  ),
  cursor: Joi.date().iso(),
  limit: Joi.number().integer().min(1).max(100).default(30),
}).unknown(false);

const resolveReportSchema = Joi.object({
  status: Joi.string().valid('resolved', 'dismissed').required(),
  resolution: Joi.string().valid(
    'no_violation', 'warning_issued', 'message_removed',
    'participant_muted', 'participant_removed', 'account_review'
  ).required(),
  resolutionNotes: Joi.string().trim().max(1500).allow('', null),
}).unknown(false);

const applyActionSchema = Joi.object({
  targetUserId: Joi.string().uuid().allow(null),
  action: Joi.string().valid(
    'delete_message', 'mute_participant', 'remove_participant'
  ).required(),
  reason: Joi.string().trim().max(500).allow('', null),
  expiresAt: Joi.date().iso().allow(null),
  metadata: Joi.object().default({}),
}).unknown(false);

module.exports = {
  messageIdParamsSchema: Joi.object({ messageId: id }),
  reportIdParamsSchema: Joi.object({ reportId: id }),
  conversationIdParamsSchema: Joi.object({ conversationId: id }),
  createReportSchema,
  listReportsSchema,
  resolveReportSchema,
  applyActionSchema,
};
