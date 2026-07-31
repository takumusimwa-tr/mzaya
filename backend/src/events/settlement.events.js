const { EventEmitter } = require('events');

const settlementEvents = new EventEmitter();
settlementEvents.setMaxListeners(50);

const SETTLEMENT_EVENT = Object.freeze({
  BATCH_CREATED: 'settlement:batch_created',
  BATCH_APPROVED: 'settlement:batch_approved',
  SETTLEMENT_SUBMITTED: 'settlement:submitted',
  SETTLEMENT_PAID: 'settlement:paid',
  SETTLEMENT_FAILED: 'settlement:failed',
});

module.exports = { settlementEvents, SETTLEMENT_EVENT };
