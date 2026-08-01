const {
  treasuryReconciliationEvents,
  TREASURY_RECONCILIATION_EVENT,
} = require('../events/treasuryReconciliation.events');

function initializeTreasuryReconciliationEventBridge(io) {
  const importCompleted = (payload) => {
    io.to('admins').emit('treasury:statement_import_completed', payload);
  };

  const matchConfirmed = (payload) => {
    io.to('admins').emit('treasury:match_confirmed', payload);
    io.to('admins').emit('finance_dashboard:refresh', {
      reason: 'treasury_match_confirmed',
      at: new Date().toISOString(),
    });
  };

  const reviewRequired = (payload) => {
    io.to('admins').emit('treasury:review_required', payload);
  };

  treasuryReconciliationEvents.on(
    TREASURY_RECONCILIATION_EVENT.IMPORT_COMPLETED,
    importCompleted
  );
  treasuryReconciliationEvents.on(
    TREASURY_RECONCILIATION_EVENT.MATCH_CONFIRMED,
    matchConfirmed
  );
  treasuryReconciliationEvents.on(
    TREASURY_RECONCILIATION_EVENT.REVIEW_REQUIRED,
    reviewRequired
  );

  return () => {
    treasuryReconciliationEvents.off(
      TREASURY_RECONCILIATION_EVENT.IMPORT_COMPLETED,
      importCompleted
    );
    treasuryReconciliationEvents.off(
      TREASURY_RECONCILIATION_EVENT.MATCH_CONFIRMED,
      matchConfirmed
    );
    treasuryReconciliationEvents.off(
      TREASURY_RECONCILIATION_EVENT.REVIEW_REQUIRED,
      reviewRequired
    );
  };
}

module.exports = {
  initializeTreasuryReconciliationEventBridge,
};
