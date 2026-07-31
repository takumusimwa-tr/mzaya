const {
  registerPushDevice,
  deactivatePushDevice,
} = require('../services/pushDevice.service');
const {
  getTotalUnread,
} = require('../services/chatNotificationState.service');

async function register(req, res, next) {
  try {
    const device = await registerPushDevice({
      userId: req.user.id,
      platform: req.body.platform,
      pushToken: req.body.pushToken,
      deviceId: req.body.deviceId,
      appVersion: req.body.appVersion,
      locale: req.body.locale,
      timezone: req.body.timezone,
    });

    return res.status(200).json({ device });
  } catch (error) {
    return next(error);
  }
}

async function deactivate(req, res, next) {
  try {
    await deactivatePushDevice({
      userId: req.user.id,
      pushToken: req.body.pushToken,
    });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

async function unreadCount(req, res, next) {
  try {
    const count = await getTotalUnread(req.user.id);
    return res.status(200).json({ count });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  deactivate,
  unreadCount,
};
