const {
  enqueueFinanceOutboxEvent,
} = require('./financeOutbox.service');

function settlementPayload(settlement) {
  return {
    settlementId: settlement.id,
    vendorId: settlement.vendor_id,
    settlementReference: settlement.settlement_reference,
    currency: settlement.currency,
    grossSalesMinor: Number(settlement.gross_sales_minor || 0),
    refundsMinor: Number(settlement.refunds_minor || 0),
    discountsMinor: Number(settlement.discounts_minor || 0),
    commissionMinor: Number(settlement.commission_minor || 0),
    platformFeeMinor: Number(settlement.platform_fee_minor || 0),
    taxWithheldMinor: Number(settlement.tax_withheld_minor || 0),
    adjustmentsMinor: Number(settlement.adjustments_minor || 0),
    amountDueMinor: Number(settlement.amount_due_minor || 0),
    amountPaidMinor: Number(settlement.amount_paid_minor || 0),
  };
}

async function emitVendorSettlementDue({
  settlement,
  transaction,
}) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'vendor_settlement',
    aggregateId: settlement.id,
    eventType: 'vendor.settlement_due',
    sourceSystem: 'vendor',
    payload: settlementPayload(settlement),
    idempotencyKey:
      `vendor_settlement:${settlement.id}:due:v1`,
  });
}

async function emitVendorSettlementPaid({
  settlement,
  transaction,
}) {
  return enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'vendor_settlement',
    aggregateId: settlement.id,
    eventType: 'vendor.settlement_paid',
    sourceSystem: 'vendor',
    payload: settlementPayload(settlement),
    idempotencyKey:
      `vendor_settlement:${settlement.id}:paid:v1`,
  });
}

module.exports = {
  settlementPayload,
  emitVendorSettlementDue,
  emitVendorSettlementPaid,
};
