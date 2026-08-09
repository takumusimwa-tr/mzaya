const {
  enqueueFinanceOutboxEvent,
} = require('./financeOutbox.service');

function payoutPayload(payout) {
  return {
    payoutId: payout.id,
    mzayaId: payout.mzaya_id,
    payoutReference: payout.payout_reference,
    payoutMethod: payout.payout_method || null,
    currency: payout.currency,
    deliveryEarningsMinor: Number(payout.delivery_earnings_minor || 0),
    tipsMinor: Number(payout.tips_minor || 0),
    incentivesMinor: Number(payout.incentives_minor || 0),
    reimbursementsMinor: Number(payout.reimbursements_minor || 0),
    penaltiesMinor: Number(payout.penalties_minor || 0),
    withholdingMinor: Number(payout.withholding_minor || 0),
    adjustmentsMinor: Number(payout.adjustments_minor || 0),
    amountDueMinor: Number(payout.amount_due_minor || 0),
    amountPaidMinor: Number(payout.amount_paid_minor || 0),
  };
}

async function emitMzayaPayoutDue({
  payout,
  transaction,
}) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'mzaya_payout',
    aggregateId: payout.id,
    eventType: 'mzaya.payout_due',
    sourceSystem: 'delivery',
    payload: payoutPayload(payout),
    idempotencyKey:
      `mzaya_payout:${payout.id}:due:v1`,
  });
}

async function emitMzayaPayoutPaid({
  payout,
  transaction,
}) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'mzaya_payout',
    aggregateId: payout.id,
    eventType: 'mzaya.payout_paid',
    sourceSystem: 'delivery',
    payload: payoutPayload(payout),
    idempotencyKey:
      `mzaya_payout:${payout.id}:paid:v1`,
  });
}

module.exports = {
  payoutPayload,
  emitMzayaPayoutDue,
  emitMzayaPayoutPaid,
};
