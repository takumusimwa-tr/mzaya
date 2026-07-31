const {
  NotificationPreference,
} = require('../models/associations');

const DEFAULTS = Object.freeze({
  order: { in_app: true, push: true, email: false, sms: false },
  dispatch: { in_app: true, push: true, email: false, sms: false },
  payment: { in_app: true, push: true, email: true, sms: false },
  account: { in_app: true, push: true, email: true, sms: false },
  marketing: { in_app: true, push: false, email: false, sms: false },
});

async function getPreferenceMap(userId) {
  const rows = await NotificationPreference.findAll({
    where: { user_id: userId },
    raw: true,
  });

  const result = JSON.parse(JSON.stringify(DEFAULTS));

  for (const row of rows) {
    result[row.category] = {
      in_app: row.in_app,
      push: row.push,
      email: row.email,
      sms: row.sms,
    };
  }

  return result;
}

async function resolveChannels({ userId, category }) {
  const preferences = await getPreferenceMap(userId);
  const selected = preferences[category] || DEFAULTS.account;

  return Object.entries(selected)
    .filter(([, enabled]) => enabled)
    .map(([channel]) => channel);
}

module.exports = {
  DEFAULTS,
  getPreferenceMap,
  resolveChannels,
};
