const cron = require('node-cron');
const { Op } = require('sequelize');
const { TreasuryTransfer } = require('../models/associations');
const {
  reconcileTreasuryTransfer,
} = require('../services/treasuryReconciliation.service');

function startTreasuryFinanceReconciliationJob({ logger = console } = {}) {
  return cron.schedule('35 * * * *', async () => {
    const transfers = await TreasuryTransfer.findAll({
      where: {
        status: 'completed',
        [Op.or]: [
          { finance_reconciliation_status: { [Op.ne]: 'matched' } },
          { finance_reconciliation_status: null },
        ],
      },
      order: [['updated_at', 'ASC']],
      limit: 100,
    });

    for (const transfer of transfers) {
      try {
        await reconcileTreasuryTransfer(transfer.id);
      } catch (error) {
        logger.error?.('treasury_finance_reconciliation_failed', {
          transferId: transfer.id,
          error: error.message,
        });
      }
    }
  });
}

module.exports = { startTreasuryFinanceReconciliationJob };
