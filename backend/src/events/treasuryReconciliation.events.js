const { EventEmitter } = require('events');

const treasuryReconciliationEvents = new EventEmitter();
treasuryReconciliationEvents.setMaxListeners(50);

const TREASURY_RECONCILIATION_EVENT = Object.freeze({
  IMPORT_COMPLETED: 'treasury:statement_import_completed',
  MATCH_PROPOSED: 'treasury:match_proposed',
  MATCH_CONFIRMED: 'treasury:match_confirmed',
  MATCH_REJECTED: 'treasury:match_rejected',
  REVIEW_REQUIRED: 'treasury:review_required',
});

module.exports = {
  treasuryReconciliationEvents,
  TREASURY_RECONCILIATION_EVENT,
};
