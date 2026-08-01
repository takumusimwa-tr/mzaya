const cron = require('node-cron');
const { Op } = require('sequelize');
const { TreasuryTransfer } = require('../models/associations');
const {
  executeTreasuryTransfer,
} = require('../services/treasuryTransferExecution.service');

function startTreasuryTransferRetryJob({ logger = console } = {}) {
  return cron.schedule('*/30 * * * *', async () => {
    const transfers = await TreasuryTransfer.findAll({
      where: {
        status: 'failed',
        updated_at: {
          [Op.lte]: new Date(Date.now() - 30 * 60 * 1000),
        },
      },
      limit: 50,
    });

    for (const transfer of transfers) {
      try {
        await transfer.update({
          status: 'approved',
          failure_reason: null,
        });

        await executeTreasuryTransfer({
          transferId: transfer.id,
          actorId: null,
        });
      } catch (error) {
        logger.error?.('treasury_transfer_retry_failed', {
          transferId: transfer.id,
          error: error.message,
        });
      }
    }
  });
}

module.exports = { startTreasuryTransferRetryJob };
