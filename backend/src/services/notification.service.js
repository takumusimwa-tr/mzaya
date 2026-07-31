const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const {
  Notification,
  NotificationDelivery,
} = require('../models/associations');
const {
  notificationEvents,
  NOTIFICATION_EVENT,
} = require('../events/notification.events');

const ALLOWED_CHANNELS = ['in_app', 'push', 'email', 'sms'];

function serviceError(message, status = 400, code = 'NOTIFICATION_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function normalizeChannels(channels = ['in_app']) {
  return [...new Set(channels)].filter((channel) =>
    ALLOWED_CHANNELS.includes(channel)
  );
}

async function createNotification({
  userId,
  eventKey,
  category,
  priority = 'normal',
  title,
  body,
  icon = null,
  actionUrl = null,
  data = {},
  channels = ['in_app'],
  transaction: externalTransaction,
}) {
  const execute = async (transaction) => {
    const notification = await Notification.create({
      user_id: userId,
      event_key: eventKey,
      category,
      priority,
      title,
      body,
      icon,
      action_url: actionUrl,
      data,
    }, { transaction });

    const selectedChannels = normalizeChannels(channels);
    if (!selectedChannels.includes('in_app')) {
      selectedChannels.unshift('in_app');
    }

    const deliveries = await NotificationDelivery.bulkCreate(
      selectedChannels.map((channel) => ({
        notification_id: notification.id,
        channel,
        status: channel === 'in_app' ? 'delivered' : 'pending',
        delivered_at: channel === 'in_app' ? new Date() : null,
      })),
      { transaction, returning: true }
    );

    const emit = () => {
      notificationEvents.emit(NOTIFICATION_EVENT.CREATED, {
        notification: notification.toJSON(),
        deliveries: deliveries.map((delivery) => delivery.toJSON()),
      });
    };

    if (transaction?.afterCommit) transaction.afterCommit(emit);
    else emit();

    return { notification, deliveries };
  };

  if (externalTransaction) return execute(externalTransaction);
  return sequelize.transaction(execute);
}

async function listNotifications({
  userId,
  unreadOnly = false,
  category,
  limit = 20,
  cursor,
}) {
  const where = {
    user_id: userId,
    archived_at: null,
  };

  if (unreadOnly) where.read_at = null;
  if (category) where.category = category;
  if (cursor) where.created_at = { [Op.lt]: new Date(cursor) };

  const rows = await Notification.findAll({
    where,
    order: [['created_at', 'DESC']],
    limit: Math.min(Number(limit) || 20, 100),
  });

  return {
    notifications: rows,
    nextCursor: rows.length
      ? rows[rows.length - 1].created_at.toISOString()
      : null,
  };
}

async function getUnreadCount(userId) {
  return Notification.count({
    where: {
      user_id: userId,
      read_at: null,
      archived_at: null,
    },
  });
}

async function markAsRead({ notificationId, userId }) {
  const notification = await Notification.findOne({
    where: { id: notificationId, user_id: userId, archived_at: null },
  });

  if (!notification) {
    throw serviceError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
  }

  if (!notification.read_at) {
    await notification.update({ read_at: new Date() });
    notificationEvents.emit(NOTIFICATION_EVENT.READ, {
      notificationId: notification.id,
      userId,
      readAt: notification.read_at,
    });
  }

  return notification;
}

async function markAllAsRead(userId) {
  const readAt = new Date();
  const [updatedCount] = await Notification.update(
    { read_at: readAt },
    {
      where: {
        user_id: userId,
        read_at: null,
        archived_at: null,
      },
    }
  );

  notificationEvents.emit(NOTIFICATION_EVENT.READ_ALL, {
    userId,
    readAt,
    updatedCount,
  });

  return { updatedCount, readAt };
}

async function archiveNotification({ notificationId, userId }) {
  const notification = await Notification.findOne({
    where: { id: notificationId, user_id: userId },
  });

  if (!notification) {
    throw serviceError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
  }

  if (!notification.archived_at) {
    await notification.update({ archived_at: new Date() });
    notificationEvents.emit(NOTIFICATION_EVENT.ARCHIVED, {
      notificationId: notification.id,
      userId,
    });
  }

  return notification;
}

module.exports = {
  ALLOWED_CHANNELS,
  normalizeChannels,
  createNotification,
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  archiveNotification,
};
