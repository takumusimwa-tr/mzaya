const { Op, fn, col } = require('sequelize');
const {
  Notification,
  NotificationDelivery,
} = require('../models/associations');
const {
  processDelivery,
} = require('./notificationQueue.service');

function serviceError(message, status = 400, code = 'NOTIFICATION_ADMIN_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

async function getNotificationHealthSummary() {
  const [notificationCount, unreadCount, deliveryRows] = await Promise.all([
    Notification.count(),
    Notification.count({ where: { read_at: null, archived_at: null } }),
    NotificationDelivery.findAll({
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    }),
  ]);

  const deliveryStatus = deliveryRows.reduce((result, row) => {
    result[row.status] = Number(row.count);
    return result;
  }, {});

  return {
    notifications: notificationCount,
    unread: unreadCount,
    deliveries: deliveryStatus,
  };
}

async function listDeliveryHealth({
  status,
  channel,
  limit = 30,
  cursor,
}) {
  const where = {};

  if (status) where.status = status;
  if (channel) where.channel = channel;
  if (cursor) where.created_at = { [Op.lt]: new Date(cursor) };

  const rows = await NotificationDelivery.findAll({
    where,
    include: [{
      model: Notification,
      as: 'notification',
      attributes: [
        'id',
        'user_id',
        'event_key',
        'category',
        'title',
        'created_at',
      ],
    }],
    order: [['created_at', 'DESC']],
    limit: Math.min(Number(limit) || 30, 100),
  });

  return {
    deliveries: rows,
    nextCursor: rows.length
      ? rows[rows.length - 1].created_at.toISOString()
      : null,
  };
}

async function retryDelivery(deliveryId) {
  const delivery = await NotificationDelivery.findByPk(deliveryId);

  if (!delivery) {
    throw serviceError(
      'Notification delivery not found',
      404,
      'DELIVERY_NOT_FOUND'
    );
  }

  if (delivery.channel === 'in_app') {
    throw serviceError(
      'In-app delivery does not use provider retry',
      422,
      'DELIVERY_NOT_RETRYABLE'
    );
  }

  await delivery.update({
    status: 'pending',
    attempts: 0,
    last_error: null,
    next_attempt_at: null,
    failed_at: null,
  });

  return processDelivery(delivery.id);
}

module.exports = {
  getNotificationHealthSummary,
  listDeliveryHealth,
  retryDelivery,
};
