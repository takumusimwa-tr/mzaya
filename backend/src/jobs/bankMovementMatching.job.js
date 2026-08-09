const cron = require('node-cron');
const { BankMovement } = require('../models/associations');
const {
  matchBankMovement,
} = require('../services/bankMovementMatching.service');

function startBankMovementMatchingJob({ logger = console } = {}) {
  return cron.schedule('*/20 * * * *', async () => {
    const movements = await BankMovement.findAll({
      where: { status: 'unmatched' },
      order: [['created_at', 'ASC']],
      limit: 100,
    });

    for (const movement of movements) {
      try {
        await matchBankMovement(movement.id);
      } catch (error) {
        logger.error?.('bank_movement_matching_failed', {
          bankMovementId: movement.id,
          error: error.message,
        });
      }
    }
  });
}

module.exports = { startBankMovementMatchingJob };
