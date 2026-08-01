const { sequelize } = require('../config/db');
const {
  PaymentAccount,
  LedgerEntry,
  LedgerTransaction,
  TrialBalanceSnapshot,
  TrialBalanceLine,
} = require('../models/associations');

async function generateTrialBalance({
  closeCycleId,
  currency,
  generatedBy,
  snapshotType = 'pre_close',
}) {
  return sequelize.transaction(async (transaction) => {
    const rows = await PaymentAccount.findAll({
      where: { currency: String(currency).toUpperCase() },
      include: [{
        model: LedgerEntry,
        as: 'entries',
        required: false,
        include: [{
          model: LedgerTransaction,
          as: 'transaction',
          required: true,
          where: { status: 'posted' },
        }],
      }],
      transaction,
    });

    let totalDebitsMinor = 0;
    let totalCreditsMinor = 0;

    const lines = rows.map((account) => {
      const debitMinor = (account.entries || [])
        .filter((entry) => entry.direction === 'debit')
        .reduce((sum, entry) => sum + Number(entry.amount_minor), 0);

      const creditMinor = (account.entries || [])
        .filter((entry) => entry.direction === 'credit')
        .reduce((sum, entry) => sum + Number(entry.amount_minor), 0);

      totalDebitsMinor += debitMinor;
      totalCreditsMinor += creditMinor;

      return {
        account,
        debitMinor,
        creditMinor,
        netMinor: debitMinor - creditMinor,
      };
    });

    const snapshot = await TrialBalanceSnapshot.create({
      close_cycle_id: closeCycleId,
      currency: String(currency).toUpperCase(),
      snapshot_type: snapshotType,
      total_debits_minor: totalDebitsMinor,
      total_credits_minor: totalCreditsMinor,
      balanced: totalDebitsMinor === totalCreditsMinor,
      generated_by: generatedBy,
    }, { transaction });

    await TrialBalanceLine.bulkCreate(
      lines.map((line) => ({
        snapshot_id: snapshot.id,
        account_id: line.account.id,
        account_code: line.account.code || null,
        account_name: line.account.name || null,
        account_type: line.account.account_type,
        debit_minor: line.debitMinor,
        credit_minor: line.creditMinor,
        net_minor: line.netMinor,
      })),
      { transaction }
    );

    return snapshot;
  });
}

module.exports = { generateTrialBalance };
