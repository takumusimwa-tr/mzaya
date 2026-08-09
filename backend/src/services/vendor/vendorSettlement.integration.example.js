/**
 * Batch 08.5.3 integration example.
 *
 * Keep this under the existing vendor domain. Merge into the vendor settlement
 * workflow once the current source is available; do not create a second vendor
 * hierarchy or duplicate existing vendor logic.
 */
const {
  createVendorSettlement,
  approveVendorSettlement,
  markVendorSettlementPaid,
} = require('../vendorSettlement.service');

async function buildVendorSettlement(input) {
  return createVendorSettlement(input);
}

async function approveSettlement(settlementId, adminUserId) {
  return approveVendorSettlement({
    settlementId,
    approvedBy: adminUserId,
  });
}

async function confirmSettlementPaid({
  settlementId,
  amountPaidMinor,
  provider,
  providerReference,
  adminUserId,
}) {
  return markVendorSettlementPaid({
    settlementId,
    amountPaidMinor,
    provider,
    providerReference,
    paidBy: adminUserId,
  });
}

module.exports = {
  buildVendorSettlement,
  approveSettlement,
  confirmSettlementPaid,
};
