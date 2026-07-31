const {
  createNotification,
} = require('./notification.service');
const {
  renderTemplate,
  hasTemplate,
} = require('./notificationTemplate.service');

const DEFAULT_CHANNELS = Object.freeze({
  customer: ['in_app'],
  vendor: ['in_app'],
  rider: ['in_app'],
  admin: ['in_app'],
});

async function notifyRecipient({
  userId,
  audience,
  eventKey,
  context,
  channels,
  transaction,
}) {
  if (!hasTemplate(eventKey)) return null;

  const rendered = renderTemplate(eventKey, context);

  return createNotification({
    userId,
    ...rendered,
    channels: channels || DEFAULT_CHANNELS[audience] || ['in_app'],
    transaction,
  });
}

async function notifyMany({
  recipients,
  eventKey,
  context,
  transaction,
}) {
  const results = [];

  for (const recipient of recipients) {
    const result = await notifyRecipient({
      userId: recipient.userId,
      audience: recipient.audience,
      eventKey,
      context,
      channels: recipient.channels,
      transaction,
    });

    if (result) results.push(result);
  }

  return results;
}

module.exports = {
  DEFAULT_CHANNELS,
  notifyRecipient,
  notifyMany,
};
