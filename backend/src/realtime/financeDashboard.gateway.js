const {
  settlementEvents,
  SETTLEMENT_EVENT,
} = require('../events/settlement.events');
const {
  disputeEvents,
  DISPUTE_EVENT,
} = require('../events/dispute.events');

/**
 * Invalidates connected admin dashboards after meaningful financial events.
 * Clients refresh aggregated data instead of receiving raw financial payloads.
 */
function initializeFinanceDashboardGateway(io) {
  const refresh = (reason) => {
    io.to('admins').emit('finance_dashboard:refresh', {
      reason,
      at: new Date().toISOString(),
    });
  };

  const settlementPaid = () => refresh('settlement_paid');
  const refundProcessed = () => refresh('refund_processed');
  const chargebackReceived = () => refresh('chargeback_received');

  settlementEvents.on(
    SETTLEMENT_EVENT.SETTLEMENT_PAID,
    settlementPaid
  );
  disputeEvents.on(
    DISPUTE_EVENT.REFUND_PROCESSED,
    refundProcessed
  );
  disputeEvents.on(
    DISPUTE_EVENT.CHARGEBACK_RECEIVED,
    chargebackReceived
  );

  return () => {
    settlementEvents.off(
      SETTLEMENT_EVENT.SETTLEMENT_PAID,
      settlementPaid
    );
    disputeEvents.off(
      DISPUTE_EVENT.REFUND_PROCESSED,
      refundProcessed
    );
    disputeEvents.off(
      DISPUTE_EVENT.CHARGEBACK_RECEIVED,
      chargebackReceived
    );
  };
}

module.exports = {
  initializeFinanceDashboardGateway,
};
