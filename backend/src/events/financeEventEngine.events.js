const { EventEmitter } = require('events');

const financeEventEngineEvents = new EventEmitter();
financeEventEngineEvents.setMaxListeners(50);

const FINANCE_EVENT_ENGINE_EVENT = Object.freeze({
  BUSINESS_EVENT_RECEIVED: 'finance_event_engine:business_event_received',
  ACCOUNTING_EVENT_PREPARED: 'finance_event_engine:accounting_event_prepared',
  ACCOUNTING_EVENT_POSTED: 'finance_event_engine:accounting_event_posted',
  POSTING_FAILED: 'finance_event_engine:posting_failed',
  REPLAY_QUEUED: 'finance_event_engine:replay_queued',
  REPLAY_COMPLETED: 'finance_event_engine:replay_completed',
});

module.exports = {
  financeEventEngineEvents,
  FINANCE_EVENT_ENGINE_EVENT,
};
