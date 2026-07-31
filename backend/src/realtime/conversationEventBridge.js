const {
  conversationEvents,
  CONVERSATION_EVENT,
} = require('../events/conversation.events');

let initialized = false;
let listeners = null;

function initializeConversationEventBridge(io) {
  if (initialized) return;

  listeners = {
    created: ({ conversationId, participantIds }) => {
      for (const userId of participantIds) {
        io.to(`user:${userId}`).emit('conversation:created', {
          conversationId,
        });
      }
    },

    messageCreated: ({
      conversationId,
      messageId,
      senderId,
      recipientIds,
    }) => {
      io.to(`conversation:${conversationId}`).emit(
        'conversation:message_created',
        {
          conversationId,
          messageId,
          senderId,
        }
      );

      for (const userId of recipientIds) {
        io.to(`user:${userId}`).emit('conversation:updated', {
          conversationId,
          messageId,
        });
      }
    },

    messageRead: ({ conversationId, messageId, userId, readAt }) => {
      io.to(`conversation:${conversationId}`).emit(
        'conversation:message_read',
        {
          conversationId,
          messageId,
          userId,
          readAt,
        }
      );
    },
  };

  conversationEvents.on(CONVERSATION_EVENT.CREATED, listeners.created);
  conversationEvents.on(
    CONVERSATION_EVENT.MESSAGE_CREATED,
    listeners.messageCreated
  );
  conversationEvents.on(
    CONVERSATION_EVENT.MESSAGE_READ,
    listeners.messageRead
  );

  initialized = true;
}

function closeConversationEventBridge() {
  if (!initialized || !listeners) return;

  conversationEvents.off(CONVERSATION_EVENT.CREATED, listeners.created);
  conversationEvents.off(
    CONVERSATION_EVENT.MESSAGE_CREATED,
    listeners.messageCreated
  );
  conversationEvents.off(
    CONVERSATION_EVENT.MESSAGE_READ,
    listeners.messageRead
  );

  listeners = null;
  initialized = false;
}

module.exports = {
  initializeConversationEventBridge,
  closeConversationEventBridge,
};
