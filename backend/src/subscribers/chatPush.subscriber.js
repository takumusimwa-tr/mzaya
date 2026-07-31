const {
  conversationEvents,
  CONVERSATION_EVENT,
} = require('../events/conversation.events');
const {
  notifyMessageRecipients,
} = require('../services/chatPush.service');

let initialized = false;
let handler = null;

function initializeChatPushSubscriber() {
  if (initialized) return;

  handler = (payload) => {
    notifyMessageRecipients(payload).catch((error) => {
      console.error('chat_push_notification_failed', {
        conversationId: payload.conversationId,
        messageId: payload.messageId,
        error: error.message,
      });
    });
  };

  conversationEvents.on(
    CONVERSATION_EVENT.MESSAGE_CREATED,
    handler
  );

  initialized = true;
}

function closeChatPushSubscriber() {
  if (!initialized || !handler) return;

  conversationEvents.off(
    CONVERSATION_EVENT.MESSAGE_CREATED,
    handler
  );

  handler = null;
  initialized = false;
}

module.exports = {
  initializeChatPushSubscriber,
  closeChatPushSubscriber,
};
