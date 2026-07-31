const {
  assertOpenFinancialPeriod,
} = require('../services/financialPeriod.service');

/**
 * Apply before posting any new ledger transaction. Reversals may require a
 * separate controlled override policy for previously closed periods.
 */
async function assertLedgerPostingPeriod({
  occurredAt = new Date(),
}) {
  return assertOpenFinancialPeriod(occurredAt);
}

module.exports = { assertLedgerPostingPeriod };
