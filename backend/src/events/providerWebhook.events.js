const { EventEmitter } = require('events');

const providerWebhookEvents = new EventEmitter();
providerWebhookEvents.setMaxListeners(50);

const PROVIDER_WEBHOOK_EVENT = Object.freeze({
  RECEIVED: 'provider_webhook:received',
  PROCESSED: 'provider_webhook:processed',
  FAILED: 'provider_webhook:failed',
  RECONCILIATION_COMPLETED: 'reconciliation:completed',
});

module.exports = {
  providerWebhookEvents,
  PROVIDER_WEBHOOK_EVENT,
};
