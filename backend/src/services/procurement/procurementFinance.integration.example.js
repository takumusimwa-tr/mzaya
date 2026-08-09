/**
 * Batch 08.5.5 integration example.
 *
 * Merge into the existing procurement flow if one already exists.
 * Preserve operational sourcing, approvals, vendor selection, notifications,
 * and delivery logic. Finance events must be emitted from the same transaction
 * as the authoritative procurement state transition.
 */
const {
  createProcurement,
  approveProcurement,
  completeProcurement,
} = require('../procurement.service');

async function createProcurementRun(input) {
  return createProcurement(input);
}

async function approveProcurementRun(procurementId, adminUserId) {
  return approveProcurement({
    procurementId,
    approvedBy: adminUserId,
  });
}

async function completeProcurementRun(procurementId, adminUserId) {
  return completeProcurement({
    procurementId,
    completedBy: adminUserId,
  });
}

module.exports = {
  createProcurementRun,
  approveProcurementRun,
  completeProcurementRun,
};
