const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const {
  Conversation,
  ConversationParticipant,
  Message,
  MessageReceipt,
  User,
} = require('../models/associations');
const {
  conversationEvents,
  CONVERSATION_EVENT,
} = require('../events/conversation.events');

function serviceError(message, status = 400, code = 'CONVERSATION_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

async function assertParticipant(conversationId, userId, transaction) {
  const participant = await ConversationParticipant.findOne({
    where: {
      conversation_id: conversationId,
      user_id: userId,
      left_at: null,
    },
    transaction,
  });

  if (!participant) {
    throw serviceError(
      'You are not an active participant in this conversation',
      403,
      'NOT_CONVERSATION_PARTICIPANT'
    );
  }

  return participant;
}

async function createConversation({
  createdBy,
  type = 'order',
  orderId = null,
  title = null,
  metadata = {},
  participants = [],
}) {
  return sequelize.transaction(async (transaction) => {
    const uniqueParticipants = new Map();

    uniqueParticipants.set(createdBy, {
      userId: createdBy,
      role: 'creator',
    });

    for (const participant of participants) {
      if (!participant?.userId) continue;
      uniqueParticipants.set(participant.userId, participant);
    }

    if (uniqueParticipants.size < 2) {
      throw serviceError(
        'A conversation requires at least two participants',
        422,
        'INSUFFICIENT_PARTICIPANTS'
      );
    }

    const conversation = await Conversation.create({
      type,
      order_id: orderId,
      created_by: createdBy,
      title,
      metadata,
    }, { transaction });

    const participantRows = [...uniqueParticipants.values()].map(
      (participant) => ({
        conversation_id: conversation.id,
        user_id: participant.userId,
        role: participant.role || 'member',
      })
    );

    await ConversationParticipant.bulkCreate(participantRows, {
      transaction,
    });

    transaction.afterCommit(() => {
      conversationEvents.emit(CONVERSATION_EVENT.CREATED, {
        conversationId: conversation.id,
        participantIds: participantRows.map((item) => item.user_id),
      });
    });

    return getConversationById(conversation.id, createdBy);
  });
}

async function getConversationById(conversationId, userId) {
  await assertParticipant(conversationId, userId);

  return Conversation.findByPk(conversationId, {
    include: [{
      model: ConversationParticipant,
      as: 'participants',
      where: { left_at: null },
      required: false,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'first_name', 'last_name'],
      }],
    }],
  });
}

async function listConversations({
  userId,
  cursor,
  limit = 30,
}) {
  const participantRows = await ConversationParticipant.findAll({
    where: {
      user_id: userId,
      left_at: null,
    },
    attributes: ['conversation_id'],
    raw: true,
  });

  const ids = participantRows.map((row) => row.conversation_id);
  if (!ids.length) return { conversations: [], nextCursor: null };

  const where = { id: { [Op.in]: ids } };
  if (cursor) where.last_message_at = { [Op.lt]: new Date(cursor) };

  const conversations = await Conversation.findAll({
    where,
    order: [
      ['last_message_at', 'DESC NULLS LAST'],
      ['created_at', 'DESC'],
    ],
    limit: Math.min(Number(limit) || 30, 100),
  });

  return {
    conversations,
    nextCursor: conversations.length
      ? (
          conversations[conversations.length - 1].last_message_at ||
          conversations[conversations.length - 1].created_at
        ).toISOString()
      : null,
  };
}

async function sendMessage({
  conversationId,
  senderId,
  clientMessageId,
  type = 'text',
  body = null,
  metadata = {},
  replyToMessageId = null,
}) {
  return sequelize.transaction(async (transaction) => {
    await assertParticipant(conversationId, senderId, transaction);

    if (clientMessageId) {
      const existing = await Message.findOne({
        where: {
          sender_id: senderId,
          client_message_id: clientMessageId,
        },
        transaction,
      });

      if (existing) return existing;
    }

    if (type === 'text' && !String(body || '').trim()) {
      throw serviceError(
        'Text messages require a body',
        422,
        'MESSAGE_BODY_REQUIRED'
      );
    }

    const message = await Message.create({
      conversation_id: conversationId,
      sender_id: senderId,
      client_message_id: clientMessageId || null,
      type,
      body: body ? String(body).trim() : null,
      metadata,
      reply_to_message_id: replyToMessageId,
    }, { transaction });

    const participants = await ConversationParticipant.findAll({
      where: {
        conversation_id: conversationId,
        left_at: null,
        user_id: { [Op.ne]: senderId },
      },
      attributes: ['user_id'],
      transaction,
      raw: true,
    });

    await MessageReceipt.bulkCreate(
      participants.map((participant) => ({
        message_id: message.id,
        user_id: participant.user_id,
      })),
      { transaction }
    );

    await Conversation.update({
      last_message_at: message.created_at,
    }, {
      where: { id: conversationId },
      transaction,
    });

    transaction.afterCommit(() => {
      conversationEvents.emit(CONVERSATION_EVENT.MESSAGE_CREATED, {
        conversationId,
        messageId: message.id,
        senderId,
        recipientIds: participants.map((item) => item.user_id),
      });
    });

    return message;
  });
}

async function listMessages({
  conversationId,
  userId,
  cursor,
  limit = 50,
}) {
  await assertParticipant(conversationId, userId);

  const where = {
    conversation_id: conversationId,
    deleted_at: null,
  };

  if (cursor) where.created_at = { [Op.lt]: new Date(cursor) };

  const messages = await Message.findAll({
    where,
    order: [['created_at', 'DESC']],
    limit: Math.min(Number(limit) || 50, 100),
  });

  return {
    messages,
    nextCursor: messages.length
      ? messages[messages.length - 1].created_at.toISOString()
      : null,
  };
}

async function markConversationRead({
  conversationId,
  userId,
  messageId,
}) {
  const participant = await assertParticipant(conversationId, userId);

  const message = await Message.findOne({
    where: {
      id: messageId,
      conversation_id: conversationId,
    },
  });

  if (!message) {
    throw serviceError('Message not found', 404, 'MESSAGE_NOT_FOUND');
  }

  const readAt = new Date();

  await sequelize.transaction(async (transaction) => {
    await participant.update({
      last_read_message_id: message.id,
      last_read_at: readAt,
    }, { transaction });

    await MessageReceipt.update({
      delivered_at: readAt,
      read_at: readAt,
    }, {
      where: {
        user_id: userId,
        message_id: {
          [Op.in]: sequelize.literal(`(
            SELECT id FROM messages
            WHERE conversation_id = '${conversationId}'
            AND created_at <= '${message.created_at.toISOString()}'
          )`),
        },
      },
      transaction,
    });
  });

  conversationEvents.emit(CONVERSATION_EVENT.MESSAGE_READ, {
    conversationId,
    messageId,
    userId,
    readAt,
  });

  return {
    conversationId,
    messageId,
    readAt,
  };
}

module.exports = {
  assertParticipant,
  createConversation,
  getConversationById,
  listConversations,
  sendMessage,
  listMessages,
  markConversationRead,
};
