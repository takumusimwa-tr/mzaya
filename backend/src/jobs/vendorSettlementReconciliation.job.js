const cron = require('node-cron');
const { Op } = require('sequelize');
const {
  VendorSettlement,
} = require('../models/associations');
const {
  reconcileVendorSettlement,
} = require('../services/vendorSettlementReconciliation.service');

function startVendorSettlementReconciliationJob({
  logger = console,
} = {}) {
  return cron.schedule('45 * * * *', async () => {
    const settlements = await VendorSettlement.findAll({
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

    for (const settlement of settlements) {
      try {
        await reconcileVendorSettlement(settlement.id);
      } catch (error) {
        logger.error?.('vendor_settlement_reconciliation_failed', {
          settlementId: settlement.id,
          error: error.message,
        });
      }
    }
  });
}

module.exports = {
  startVendorSettlementReconciliationJob,
};
