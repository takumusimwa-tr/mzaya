const { EventEmitter } = require('events');

const moderationEvents = new EventEmitter();
moderationEvents.setMaxListeners(50);

const MODERATION_EVENT = Object.freeze({
  REPORT_CREATED: 'moderation:report_created',
  REPORT_RESOLVED: 'moderation:report_resolved',
  ACTION_APPLIED: 'moderation:action_applied',
});

module.exports = { moderationEvents, MODERATION_EVENT };
