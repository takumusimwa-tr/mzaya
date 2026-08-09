const cron = require('node-cron');
const { Op } = require('sequelize');
const {
  ProcurementRun,
} = require('../models/associations');
const {
  reconcileProcurement,
} = require('../services/procurementReconciliation.service');

function startProcurementFinanceReconciliationJob({
  logger = console,
} = {}) {
  return cron.schedule('25 * * * *', async () => {
    const procurements = await ProcurementRun.findAll({
      where: {
        status: { [Op.in]: ['approved', 'completed'] },
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

    for (const procurement of procurements) {
      try {
        await reconcileProcurement(procurement.id);
      } catch (error) {
        logger.error?.('procurement_finance_reconciliation_failed', {
          procurementId: procurement.id,
          error: error.message,
        });
      }
    }
  });
}

module.exports = {
  startProcurementFinanceReconciliationJob,
};
