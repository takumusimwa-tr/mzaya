const { EventEmitter } = require('events');

const conversationEvents = new EventEmitter();
conversationEvents.setMaxListeners(50);

const CONVERSATION_EVENT = Object.freeze({
  CREATED: 'conversation:created',
  MESSAGE_CREATED: 'conversation:message_created',
  MESSAGE_READ: 'conversation:message_read',
  PARTICIPANT_JOINED: 'conversation:participant_joined',
  PARTICIPANT_LEFT: 'conversation:participant_left',
});

module.exports = {
  conversationEvents,
  CONVERSATION_EVENT,
};
