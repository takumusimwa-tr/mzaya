const { Op } = require('sequelize');
const {
  Conversation,
  ConversationParticipant,
  Message,
  User,
} = require('../models/associations');
const {
  ensureOrderConversation,
} = require('./orderConversation.service');
const {
  assertParticipant,
} = require('./conversation.service');

async function getVendorConversation({
  orderId,
  vendorUserId,
}) {
  const conversation = await ensureOrderConversation({
    orderId,
    requestedBy: vendorUserId,
  });

  await assertParticipant(conversation.id, vendorUserId);

  return Conversation.findByPk(conversation.id, {
    include: [
      {
        model: ConversationParticipant,
        as: 'participants',
        where: { left_at: null },
        required: false,
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name'],
        }],
      },
      {
        model: Message,
        as: 'messages',
        where: { deleted_at: null },
        required: false,
        limit: 1,
        separate: true,
        order: [['created_at', 'DESC']],
      },
    ],
  });
}

async function listVendorConversations({
  vendorUserId,
  cursor,
  limit = 30,
}) {
  const memberships = await ConversationParticipant.findAll({
    where: {
      user_id: vendorUserId,
      role: 'vendor',
      left_at: null,
    },
    attributes: ['conversation_id'],
    raw: true,
  });

  const ids = memberships.map((item) => item.conversation_id);
  if (!ids.length) return { conversations: [], nextCursor: null };

  const where = {
    id: { [Op.in]: ids },
    type: 'order',
    status: 'active',
  };

  if (cursor) {
    where.last_message_at = { [Op.lt]: new Date(cursor) };
  }

  const conversations = await Conversation.findAll({
    where,
    order: [
      ['last_message_at', 'DESC NULLS LAST'],
      ['created_at', 'DESC'],
    ],
    limit: Math.min(Number(limit) || 30, 100),
  });

  const last = conversations[conversations.length - 1];

  return {
    conversations,
    nextCursor: last
      ? (last.last_message_at || last.created_at).toISOString()
      : null,
  };
}

module.exports = {
  getVendorConversation,
  listVendorConversations,
};
