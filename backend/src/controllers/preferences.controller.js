const {
  getPreferenceMap,
} = require('../services/notificationPreference.service');
const {
  NotificationPreference,
} = require('../models/associations');

async function getPreferences(req, res, next) {
  try {
    const preferences = await getPreferenceMap(req.user.id);
    return res.status(200).json({ preferences });
  } catch (error) {
    return next(error);
  }
}

async function updatePreferences(req, res, next) {
  try {
    const entries = Object.entries(req.body.preferences || {});

    for (const [category, channels] of entries) {
      await NotificationPreference.upsert({
        user_id: req.user.id,
        category,
        in_app: true,
        push: Boolean(channels.push),
        email: Boolean(channels.email),
        sms: Boolean(channels.sms),
      });
    }

    const preferences = await getPreferenceMap(req.user.id);
    return res.status(200).json({ preferences });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getPreferences,
  updatePreferences,
};
