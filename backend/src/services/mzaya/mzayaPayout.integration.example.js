/**
 * Batch 08.5.4 integration example.
 *
 * Mzaya is the platform term for the delivery partner. If the current backend
 * still has legacy `rider` naming internally, preserve compatibility while
 * exposing the new payout service under the Mzaya domain.
 */
const {
  createMzayaPayout,
  approveMzayaPayout,
  markMzayaPayoutPaid,
} = require('../mzayaPayout.service');

async function buildMzayaPayout(input) {
  return createMzayaPayout(input);
}

async function approvePayout(payoutId, adminUserId) {
  return approveMzayaPayout({
    payoutId,
    approvedBy: adminUserId,
  });
}

async function confirmPayoutPaid({
  payoutId,
  amountPaidMinor,
  provider,
  providerReference,
  adminUserId,
}) {
  return markMzayaPayoutPaid({
    payoutId,
    amountPaidMinor,
    provider,
    providerReference,
    paidBy: adminUserId,
  });
}

module.exports = {
  buildMzayaPayout,
  approvePayout,
  confirmPayoutPaid,
};
