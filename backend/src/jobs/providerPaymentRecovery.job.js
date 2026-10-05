const cron = require('node-cron');
const { Op } = require('sequelize');
const {
  PaymentAttempt,
} = require('../models/associations');
const { logger } = require('../utils/logger');

async function recoverStalePendingPayments({
  olderThanMinutes = 20,
  limit = 100,
} = {}) {
  const cutoff = new Date(
    Date.now() - olderThanMinutes * 60 * 1000
  );

  const pending = await PaymentAttempt.findAll({
    where: {
      status: {
        [Op.in]: ['pending', 'processing'],
      },
      created_at: {
        [Op.lte]: cutoff,
      },
    },
    order: [['created_at', 'ASC']],
    limit,
  });

  // This job deliberately does not invent provider results.
  // It flags stale attempts for provider-specific polling/review.
  for (const payment of pending) {
    logger.warn('payment_provider_recovery_required', {
      paymentId: payment.id,
      provider: payment.provider,
      providerReference: payment.provider_reference,
      ageMinutes: Math.floor(
        (Date.now() - new Date(payment.created_at).getTime()) / 60000
      ),
    });
  }

  return pending;
}

function startProviderPaymentRecoveryJob() {
  return cron.schedule('*/10 * * * *', async () => {
    await recoverStalePendingPayments();
  });
}

module.exports = {
  recoverStalePendingPayments,
  startProviderPaymentRecoveryJob,
};
