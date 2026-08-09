const cron = require('node-cron');
const { Op } = require('sequelize');
const {
  MzayaPayout,
} = require('../models/associations');
const {
  reconcileMzayaPayout,
} = require('../services/mzayaPayoutReconciliation.service');

function startMzayaPayoutReconciliationJob({
  logger = console,
} = {}) {
  return cron.schedule('10 * * * *', async () => {
    const payouts = await MzayaPayout.findAll({
      where: {
        status: { [Op.in]: ['approved', 'paid'] },
        [Op.or]: [
          {
            finance_reconciliation_status: {
              [Op.ne]: 'matched',
            },
          },
          { finance_reconciliation_status: null },
        ],
      },
      order: [['updated_at', 'ASC']],
      limit: 100,
    });

    for (const payout of payouts) {
      try {
        await reconcileMzayaPayout(payout.id);
      } catch (error) {
        logger.error?.('mzaya_payout_reconciliation_failed', {
          payoutId: payout.id,
          error: error.message,
        });
      }
    }
  });
}

module.exports = {
  startMzayaPayoutReconciliationJob,
};
