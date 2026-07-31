const cron = require('node-cron');
const {
  SettlementProfile,
} = require('../models/associations');
const {
  createSettlementBatch,
} = require('../services/settlementBatch.service');

async function createDueSettlementBatches({ logger = console } = {}) {
  const profiles = await SettlementProfile.findAll({
    where: {
      status: 'active',
    },
    attributes: ['owner_type', 'currency'],
    group: ['owner_type', 'currency'],
    raw: true,
  });

  const settlementDate = new Date().toISOString().slice(0, 10);
  const results = [];

  for (const group of profiles) {
    try {
      results.push(await createSettlementBatch({
        ownerType: group.owner_type,
        currency: group.currency,
        settlementDate,
        createdBy: null,
      }));
    } catch (error) {
      logger.error?.('settlement_batch_creation_failed', {
        ownerType: group.owner_type,
        currency: group.currency,
        error: error.message,
      });
    }
  }

  return results;
}

function startSettlementScheduler({ logger = console } = {}) {
  return cron.schedule('10 1 * * *', () => {
    createDueSettlementBatches({ logger }).catch((error) => {
      logger.error?.('settlement_scheduler_failed', {
        error: error.message,
      });
    });
  });
}

module.exports = {
  createDueSettlementBatches,
  startSettlementScheduler,
};
