const { EventEmitter } = require('events');

const supportEvents = new EventEmitter();
supportEvents.setMaxListeners(50);

const SUPPORT_EVENT = Object.freeze({
  TICKET_CREATED: 'support:ticket_created',
  TICKET_ASSIGNED: 'support:ticket_assigned',
  TICKET_ESCALATED: 'support:ticket_escalated',
  TICKET_STATUS_CHANGED: 'support:ticket_status_changed',
  NOTE_CREATED: 'support:note_created',
});

module.exports = {
  supportEvents,
  SUPPORT_EVENT,
};
