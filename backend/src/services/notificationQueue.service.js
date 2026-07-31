const { Op } = require('sequelize');
const {
  Notification,
  NotificationDelivery,
  User,
} = require('../models/associations');
const { sendEmail } = require('./email.service');
const { sendSms } = require('./sms.service');
const { sendPush } = require('./push.service');
const {
  notificationEvents,
  NOTIFICATION_EVENT,
} = require('../events/notification.events');

const MAX_ATTEMPTS = Number(process.env.NOTIFICATION_MAX_ATTEMPTS || 5);
const BASE_RETRY_MINUTES = Number(process.env.NOTIFICATION_RETRY_MINUTES || 2);

function nextRetryDate(attempts) {
  const multiplier = Math.max(1, 2 ** Math.max(0, attempts - 1));
  return new Date(Date.now() + BASE_RETRY_MINUTES * multiplier * 60_000);
}

async function loadDelivery(deliveryId) {
  return NotificationDelivery.findByPk(deliveryId, {
    include: [{
      model: Notification,
      as: 'notification',
      required: true,
      include: [{
        model: User,
        as: 'user',
        required: true,
      }],
    }],
  });
}

async function deliverByChannel(delivery) {
  const notification = delivery.notification;
  const user = notification.user;

  if (delivery.channel === 'email') {
    return sendEmail({
      to: user.email,
      subject: notification.title,
      text: notification.body,
      html: null,
      metadata: { notificationId: notification.id },
    });
  }

  if (delivery.channel === 'sms') {
    return sendSms({
      to: user.phone || user.mobile,
      message: notification.body,
      metadata: { notificationId: notification.id },
    });
  }

  if (delivery.channel === 'push') {
    return sendPush({
      token: user.push_token,
      title: notification.title,
      body: notification.body,
      data: notification.data,
    });
  }

  return {
    skipped: true,
    provider: 'in_app',
    providerMessageId: null,
  };
}

async function processDelivery(deliveryId) {
  const delivery = await loadDelivery(deliveryId);
  if (!delivery) return null;
  if (!['pending', 'failed'].includes(delivery.status)) return delivery;

  await delivery.update({
    status: 'processing',
    attempts: delivery.attempts + 1,
    last_error: null,
  });

  try {
    const result = await deliverByChannel(delivery);

    await delivery.update({
      status: result.skipped ? 'skipped' : 'delivered',
      provider: result.provider || null,
      provider_message_id: result.providerMessageId || null,
      delivered_at: result.skipped ? null : new Date(),
      failed_at: null,
      next_attempt_at: null,
    });

    return delivery;
  } catch (error) {
    const terminal = delivery.attempts >= MAX_ATTEMPTS;

    await delivery.update({
      status: 'failed',
      last_error: String(error.message || error).slice(0, 500),
      failed_at: terminal ? new Date() : null,
      next_attempt_at: terminal ? null : nextRetryDate(delivery.attempts),
    });

    return delivery;
  }
}

async function queuePendingDeliveries(notificationId) {
  const deliveries = await NotificationDelivery.findAll({
    where: {
      notification_id: notificationId,
      status: 'pending',
      channel: { [Op.ne]: 'in_app' },
    },
  });

  for (const delivery of deliveries) {
    notificationEvents.emit(NOTIFICATION_EVENT.DELIVERY_QUEUED, {
      deliveryId: delivery.id,
      notificationId,
      channel: delivery.channel,
    });
  }

  return deliveries;
}

async function processDueDeliveries(limit = 50) {
  const deliveries = await NotificationDelivery.findAll({
    where: {
      status: { [Op.in]: ['pending', 'failed'] },
      channel: { [Op.ne]: 'in_app' },
      [Op.or]: [
        { next_attempt_at: null },
        { next_attempt_at: { [Op.lte]: new Date() } },
      ],
    },
    order: [['created_at', 'ASC']],
    limit,
  });

  const results = [];
  for (const delivery of deliveries) {
    results.push(await processDelivery(delivery.id));
  }
  return results;
}

module.exports = {
  MAX_ATTEMPTS,
  BASE_RETRY_MINUTES,
  nextRetryDate,
  processDelivery,
  queuePendingDeliveries,
  processDueDeliveries,
};
