const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const {
  FinanceDeliveryLease,
  FinanceOutboxEvent,
} = require('../models/associations');

async function acquireDeliveryLease({
  outboxEventId,
  workerId,
  leaseSeconds = 60,
}) {
  return sequelize.transaction(async (transaction) => {
    const event = await FinanceOutboxEvent.findByPk(outboxEventId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!event || !['pending', 'retry'].includes(event.status)) {
      return null;
    }

    await FinanceDeliveryLease.update({
      status: 'expired',
    }, {
      where: {
        outbox_event_id: outboxEventId,
        status: 'active',
        lease_expires_at: { [Op.lt]: new Date() },
      },
      transaction,
    });

    const activeLease = await FinanceDeliveryLease.findOne({
      where: {
        outbox_event_id: outboxEventId,
        status: 'active',
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (activeLease) return null;

    const lease = await FinanceDeliveryLease.create({
      outbox_event_id: outboxEventId,
      lease_owner: workerId,
      leased_at: new Date(),
      lease_expires_at: new Date(Date.now() + leaseSeconds * 1000),
      status: 'active',
    }, { transaction });

    await event.update({ status: 'publishing' }, { transaction });

    return lease;
  });
}

async function releaseDeliveryLease({
  leaseId,
  status = 'released',
}) {
  const lease = await FinanceDeliveryLease.findByPk(leaseId);
  if (!lease) return null;

  await lease.update({
    status,
    released_at: new Date(),
  });

  return lease;
}

module.exports = {
  acquireDeliveryLease,
  releaseDeliveryLease,
};
