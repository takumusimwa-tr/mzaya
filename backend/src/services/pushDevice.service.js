const {
  PushDevice,
} = require('../models/associations');

async function registerPushDevice({
  userId,
  platform,
  pushToken,
  deviceId = null,
  appVersion = null,
  locale = null,
  timezone = null,
}) {
  const [device] = await PushDevice.findOrCreate({
    where: { push_token: pushToken },
    defaults: {
      user_id: userId,
      platform,
      device_id: deviceId,
      app_version: appVersion,
      locale,
      timezone,
      is_active: true,
      last_seen_at: new Date(),
    },
  });

  await device.update({
    user_id: userId,
    platform,
    device_id: deviceId,
    app_version: appVersion,
    locale,
    timezone,
    is_active: true,
    last_seen_at: new Date(),
  });

  return device;
}

async function deactivatePushDevice({
  userId,
  pushToken,
}) {
  const device = await PushDevice.findOne({
    where: {
      user_id: userId,
      push_token: pushToken,
    },
  });

  if (!device) return null;

  await device.update({
    is_active: false,
    last_seen_at: new Date(),
  });

  return device;
}

async function listActiveDevices(userId) {
  return PushDevice.findAll({
    where: {
      user_id: userId,
      is_active: true,
    },
    order: [['last_seen_at', 'DESC']],
  });
}

module.exports = {
  registerPushDevice,
  deactivatePushDevice,
  listActiveDevices,
};
