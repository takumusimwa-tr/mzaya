const { EventEmitter } = require('events');

const vendorConversationEvents = new EventEmitter();
vendorConversationEvents.setMaxListeners(50);

const VENDOR_CONVERSATION_EVENT = Object.freeze({
  READY: 'vendor_conversation:ready',
  REASSIGNED: 'vendor_conversation:reassigned',
  ORDER_STATUS_CHANGED: 'vendor_conversation:order_status_changed',
  QUICK_REPLY_SENT: 'vendor_conversation:quick_reply_sent',
});

module.exports = {
  vendorConversationEvents,
  VENDOR_CONVERSATION_EVENT,
};
