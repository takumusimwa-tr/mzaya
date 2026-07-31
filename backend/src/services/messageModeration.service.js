const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const {
  Message,
  MessageReport,
  ConversationModerationAction,
  ConversationParticipant,
} = require('../models/associations');
const { assertParticipant } = require('./conversation.service');
const { moderationEvents, MODERATION_EVENT } = require('../events/moderation.events');

function serviceError(message, status = 400, code = 'MODERATION_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

async function reportMessage({ messageId, reporterId, reason, details = null }) {
  const message = await Message.findByPk(messageId);
  if (!message || message.deleted_at) {
    throw serviceError('Message not found', 404, 'MESSAGE_NOT_FOUND');
  }

  await assertParticipant(message.conversation_id, reporterId);

  if (String(message.sender_id) === String(reporterId)) {
    throw serviceError('You cannot report your own message', 422, 'SELF_REPORT_NOT_ALLOWED');
  }

  const [report, created] = await MessageReport.findOrCreate({
    where: { message_id: message.id, reporter_id: reporterId },
    defaults: {
      conversation_id: message.conversation_id,
      reported_user_id: message.sender_id,
      reason,
      details,
    },
  });

  if (created) {
    moderationEvents.emit(MODERATION_EVENT.REPORT_CREATED, {
      reportId: report.id,
      conversationId: report.conversation_id,
      messageId: report.message_id,
    });
  }

  return report;
}

async function listReports({ status, reason, cursor, limit = 30 }) {
  const where = {};
  if (status) where.status = status;
  if (reason) where.reason = reason;
  if (cursor) where.created_at = { [Op.lt]: new Date(cursor) };

  const reports = await MessageReport.findAll({
    where,
    order: [['created_at', 'ASC']],
    limit: Math.min(Number(limit) || 30, 100),
  });

  const last = reports[reports.length - 1];
  return { reports, nextCursor: last ? last.created_at.toISOString() : null };
}

async function resolveReport({ reportId, reviewerId, status, resolution, resolutionNotes }) {
  const report = await MessageReport.findByPk(reportId);
  if (!report) throw serviceError('Report not found', 404, 'REPORT_NOT_FOUND');

  await report.update({
    status,
    reviewed_by: reviewerId,
    reviewed_at: new Date(),
    resolution,
    resolution_notes: resolutionNotes || null,
  });

  moderationEvents.emit(MODERATION_EVENT.REPORT_RESOLVED, {
    reportId: report.id,
    conversationId: report.conversation_id,
    status: report.status,
  });

  return report;
}

async function applyModerationAction({
  conversationId,
  actorId,
  targetUserId = null,
  action,
  reason = null,
  expiresAt = null,
  metadata = {},
}) {
  return sequelize.transaction(async (transaction) => {
    if (targetUserId) {
      const participant = await ConversationParticipant.findOne({
        where: {
          conversation_id: conversationId,
          user_id: targetUserId,
          left_at: null,
        },
        transaction,
      });

      if (!participant) {
        throw serviceError('Target participant not found', 404, 'TARGET_NOT_FOUND');
      }

      if (action === 'remove_participant') {
        await participant.update({ left_at: new Date() }, { transaction });
      }

      if (action === 'mute_participant') {
        await participant.update({ muted_until: expiresAt }, { transaction });
      }
    }

    if (action === 'delete_message' && metadata.messageId) {
      const message = await Message.findOne({
        where: { id: metadata.messageId, conversation_id: conversationId },
        transaction,
      });
      if (!message) throw serviceError('Message not found', 404, 'MESSAGE_NOT_FOUND');

      await message.update({
        deleted_at: new Date(),
        body: null,
        metadata: { ...message.metadata, moderated: true },
      }, { transaction });
    }

    const record = await ConversationModerationAction.create({
      conversation_id: conversationId,
      target_user_id: targetUserId,
      actor_id: actorId,
      action,
      reason,
      expires_at: expiresAt,
      metadata,
    }, { transaction });

    transaction.afterCommit(() => {
      moderationEvents.emit(MODERATION_EVENT.ACTION_APPLIED, {
        actionId: record.id,
        conversationId,
        targetUserId,
        action,
      });
    });

    return record;
  });
}

module.exports = {
  reportMessage,
  listReports,
  resolveReport,
  applyModerationAction,
};
