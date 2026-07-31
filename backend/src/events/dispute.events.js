const { EventEmitter } = require('events');

const disputeEvents = new EventEmitter();
disputeEvents.setMaxListeners(50);

const DISPUTE_EVENT = Object.freeze({
  CREATED: 'dispute:created',
  UPDATED: 'dispute:updated',
  DEADLINE_NEAR: 'dispute:deadline_near',
  REFUND_REQUESTED: 'refund:requested',
  REFUND_PROCESSED: 'refund:processed',
  CHARGEBACK_RECEIVED: 'chargeback:received',
});

module.exports = { disputeEvents, DISPUTE_EVENT };
