const {
  Conversation,
  ConversationParticipant,
} = require('../models/associations');

async function findOrderConversation({ orderId, transaction }) {
  return Conversation.findOne({
    where: {
      order_id: orderId,
      type: 'order',
      status: 'active',
    },
    transaction,
  });
}

async function listActiveParticipantIds(conversationId, transaction) {
  const rows = await ConversationParticipant.findAll({
    where: {
      conversation_id: conversationId,
      left_at: null,
    },
    attributes: ['user_id', 'role'],
    raw: true,
    transaction,
  });

  return rows;
}

module.exports = {
  findOrderConversation,
  listActiveParticipantIds,
};
