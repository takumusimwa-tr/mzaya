const { Op } = require('sequelize');
const {
  FinanceDeliveryLease,
  FinanceOutboxEvent,
} = require('../models/associations');

async function recoverStaleLeases() {
  const stale = await FinanceDeliveryLease.findAll({
    where: {
      status: 'active',
      lease_expires_at: { [Op.lt]: new Date() },
    },
  });

  for (const lease of stale) {
    await lease.update({
      status: 'expired',
      released_at: new Date(),
    });

    await FinanceOutboxEvent.update({
      status: 'retry',
      available_at: new Date(),
    }, {
      where: {
        id: lease.outbox_event_id,
        status: 'publishing',
      },
    });
  }

  return stale.length;
}

module.exports = {
  recoverStaleLeases,
};
