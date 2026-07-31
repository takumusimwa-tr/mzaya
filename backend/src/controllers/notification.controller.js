const {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  archiveNotification,
} = require('../services/notification.service');

async function list(req, res, next) {
  try {
    const result = await listNotifications({
      userId: req.user.id,
      unreadOnly: req.query.unread === 'true',
      category: req.query.category,
      limit: req.query.limit,
      cursor: req.query.cursor,
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function unreadCount(req, res, next) {
  try {
    const count = await getUnreadCount(req.user.id);
    return res.status(200).json({ count });
  } catch (error) {
    return next(error);
  }
}

async function readOne(req, res, next) {
  try {
    const notification = await markAsRead({
      notificationId: req.params.notificationId,
      userId: req.user.id,
    });

    return res.status(200).json({ notification });
  } catch (error) {
    return next(error);
  }
}

async function readAll(req, res, next) {
  try {
    const result = await markAllAsRead(req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function archive(req, res, next) {
  try {
    await archiveNotification({
      notificationId: req.params.notificationId,
      userId: req.user.id,
    });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  unreadCount,
  readOne,
  readAll,
  archive,
};
