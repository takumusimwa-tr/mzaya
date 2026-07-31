const {
  MessageNotificationState,
} = require('../models/associations');

async function incrementUnread({
  conversationId,
  userId,
  messageId,
}) {
  const [state] = await MessageNotificationState.findOrCreate({
    where: {
      conversation_id: conversationId,
      user_id: userId,
    },
    defaults: {
      unread_count: 0,
    },
  });

  await state.increment('unread_count', { by: 1 });
  await state.update({
    last_notified_message_id: messageId,
    last_notified_at: new Date(),
  });

  await state.reload();
  return state;
}

async function clearUnread({
  conversationId,
  userId,
}) {
  const [state] = await MessageNotificationState.findOrCreate({
    where: {
      conversation_id: conversationId,
      user_id: userId,
    },
    defaults: {
      unread_count: 0,
    },
  });

  await state.update({
    unread_count: 0,
  });

  return state;
}

async function getTotalUnread(userId) {
  const value = await MessageNotificationState.sum('unread_count', {
    where: { user_id: userId },
  });

  return Number(value || 0);
}

module.exports = {
  incrementUnread,
  clearUnread,
  getTotalUnread,
};
