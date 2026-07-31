const {
  settlementEvents,
  SETTLEMENT_EVENT,
} = require('../events/settlement.events');

function initializeSettlementEventBridge(io) {
  const batchCreated = (payload) => {
    io.to('admins').emit('settlement:batch_created', payload);
  };

  const batchApproved = (payload) => {
    io.to('admins').emit('settlement:batch_approved', payload);
  };

  const settlementPaid = (payload) => {
    io.to('admins').emit('settlement:paid', payload);
    io.to(`user:${payload.ownerId}`).emit('settlement:paid', payload);
  };

  const settlementFailed = (payload) => {
    io.to('admins').emit('settlement:failed', payload);
  };

  settlementEvents.on(SETTLEMENT_EVENT.BATCH_CREATED, batchCreated);
  settlementEvents.on(SETTLEMENT_EVENT.BATCH_APPROVED, batchApproved);
  settlementEvents.on(SETTLEMENT_EVENT.SETTLEMENT_PAID, settlementPaid);
  settlementEvents.on(SETTLEMENT_EVENT.SETTLEMENT_FAILED, settlementFailed);

  return () => {
    settlementEvents.off(SETTLEMENT_EVENT.BATCH_CREATED, batchCreated);
    settlementEvents.off(SETTLEMENT_EVENT.BATCH_APPROVED, batchApproved);
    settlementEvents.off(SETTLEMENT_EVENT.SETTLEMENT_PAID, settlementPaid);
    settlementEvents.off(SETTLEMENT_EVENT.SETTLEMENT_FAILED, settlementFailed);
  };
}

module.exports = {
  initializeSettlementEventBridge,
};
