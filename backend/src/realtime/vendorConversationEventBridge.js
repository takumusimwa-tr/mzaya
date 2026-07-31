const {
  vendorConversationEvents,
  VENDOR_CONVERSATION_EVENT,
} = require('../events/vendorConversation.events');

function initializeVendorConversationEventBridge(io) {
  const listeners = {
    ready: ({ conversationId, orderId, participantIds }) => {
      for (const userId of participantIds) {
        io.to(`user:${userId}`).emit('vendor_conversation:ready', {
          conversationId,
          orderId,
        });
      }
    },

    reassigned: (payload) => {
      io.to(`conversation:${payload.conversationId}`).emit(
        'vendor_conversation:reassigned',
        payload
      );
    },

    statusChanged: (payload) => {
      io.to(`conversation:${payload.conversationId}`).emit(
        'vendor_conversation:order_status_changed',
        payload
      );
    },

    quickReplySent: (payload) => {
      io.to(`conversation:${payload.conversationId}`).emit(
        'vendor_conversation:quick_reply_sent',
        payload
      );
    },
  };

  vendorConversationEvents.on(
    VENDOR_CONVERSATION_EVENT.READY,
    listeners.ready
  );
  vendorConversationEvents.on(
    VENDOR_CONVERSATION_EVENT.REASSIGNED,
    listeners.reassigned
  );
  vendorConversationEvents.on(
    VENDOR_CONVERSATION_EVENT.ORDER_STATUS_CHANGED,
    listeners.statusChanged
  );
  vendorConversationEvents.on(
    VENDOR_CONVERSATION_EVENT.QUICK_REPLY_SENT,
    listeners.quickReplySent
  );

  return () => {
    vendorConversationEvents.off(
      VENDOR_CONVERSATION_EVENT.READY,
      listeners.ready
    );
    vendorConversationEvents.off(
      VENDOR_CONVERSATION_EVENT.REASSIGNED,
      listeners.reassigned
    );
    vendorConversationEvents.off(
      VENDOR_CONVERSATION_EVENT.ORDER_STATUS_CHANGED,
      listeners.statusChanged
    );
    vendorConversationEvents.off(
      VENDOR_CONVERSATION_EVENT.QUICK_REPLY_SENT,
      listeners.quickReplySent
    );
  };
}

module.exports = {
  initializeVendorConversationEventBridge,
};
