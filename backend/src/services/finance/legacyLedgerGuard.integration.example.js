/**
 * Batch 08.5.8 integration example.
 *
 * Put this guard immediately before any remaining legacy direct-ledger write.
 * Once the domain cutover is active, the old posting path is blocked and the
 * operational service must publish a finance event instead.
 */
const {
  assertLegacyPostingAllowed,
} = require('../financeLegacyPostingGuard.service');

async function guardLegacyLedgerPost({
  domainKey,
  action,
  recordId,
  userId = null,
  payload = {},
}) {
  return assertLegacyPostingAllowed({
    sourceModule: domainKey,
    sourceAction: action,
    sourceRecordId: recordId,
    attemptedBy: userId,
    payload,
  });
}

module.exports = {
  guardLegacyLedgerPost,
};
