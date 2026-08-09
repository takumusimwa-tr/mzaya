const { EventEmitter } = require('events');

const financeDeliveryEvents = new EventEmitter();
financeDeliveryEvents.setMaxListeners(50);

const FINANCE_DELIVERY_EVENT = Object.freeze({
  OUTBOX_PUBLISHED: 'finance_delivery:outbox_published',
  DELIVERY_FAILED: 'finance_delivery:delivery_failed',
  DEAD_LETTER_CREATED: 'finance_delivery:dead_letter_created',
  DEAD_LETTER_REPLAYED: 'finance_delivery:dead_letter_replayed',
  RELIABILITY_DEGRADED: 'finance_delivery:reliability_degraded',
});

module.exports = {
  financeDeliveryEvents,
  FINANCE_DELIVERY_EVENT,
};
