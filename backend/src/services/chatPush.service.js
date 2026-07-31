const {
  PushDeliveryLog,
  User,
  Conversation,
  Message,
} = require('../models/associations');
const {
  listActiveDevices,
} = require('./pushDevice.service');
const {
  incrementUnread,
} = require('./chatNotificationState.service');
const {
  buildMessagePush,
} = require('./chatPushTemplate.service');
const {
  sendPushMessage,
} = require('./pushGateway.service');

async function notifyMessageRecipients({
  conversationId,
  messageId,
  senderId,
  recipientIds,
}) {
  const [conversation, message, sender] = await Promise.all([
    Conversation.findByPk(conversationId),
    Message.findByPk(messageId),
    User.findByPk(senderId, {
      attributes: ['id', 'first_name', 'last_name'],
    }),
  ]);

  if (!conversation || !message) return [];

  const results = [];

  for (const userId of recipientIds) {
    const state = await incrementUnread({
      conversationId,
      userId,
      messageId,
    });

    const push = buildMessagePush({
      message,
      conversation,
      sender,
      unreadCount: state.unread_count,
    });

    const devices = await listActiveDevices(userId);

    for (const device of devices) {
      const log = await PushDeliveryLog.create({
        user_id: userId,
        device_id: device.id,
        event_key: 'conversation.message',
        payload: push,
        status: 'pending',
      });

      try {
        const result = await sendPushMessage({
          token: device.push_token,
          ...push,
        });

        await log.update({
          status: result.skipped ? 'skipped' : 'delivered',
          provider: result.provider || null,
          provider_message_id: result.providerMessageId || null,
          attempted_at: new Date(),
          delivered_at: result.skipped ? null : new Date(),
        });

        results.push(log);
      } catch (error) {
        await log.update({
          status: 'failed',
          attempted_at: new Date(),
          error_message: String(error.message || error).slice(0, 500),
        });

        results.push(log);
      }
    }
  }

  return results;
}

module.exports = {
  notifyMessageRecipients,
};
