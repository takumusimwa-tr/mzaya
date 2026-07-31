const {
  providerWebhookEvents,
  PROVIDER_WEBHOOK_EVENT,
} = require('../events/providerWebhook.events');

function initializeProviderWebhookEventBridge(io) {
  const processed = (payload) => {
    io.to('admins').emit('provider_webhook:processed', payload);
    io.to('admins').emit('finance_dashboard:refresh', {
      reason: 'provider_webhook_processed',
      at: new Date().toISOString(),
    });
  };

  const failed = (payload) => {
    io.to('admins').emit('provider_webhook:failed', payload);
  };

  const reconciliationCompleted = (payload) => {
    io.to('admins').emit('reconciliation:completed', payload);
    io.to('admins').emit('finance_dashboard:refresh', {
      reason: 'reconciliation_completed',
      at: new Date().toISOString(),
    });
  };

  providerWebhookEvents.on(
    PROVIDER_WEBHOOK_EVENT.PROCESSED,
    processed
  );
  providerWebhookEvents.on(
    PROVIDER_WEBHOOK_EVENT.FAILED,
    failed
  );
  providerWebhookEvents.on(
    PROVIDER_WEBHOOK_EVENT.RECONCILIATION_COMPLETED,
    reconciliationCompleted
  );

  return () => {
    providerWebhookEvents.off(
      PROVIDER_WEBHOOK_EVENT.PROCESSED,
      processed
    );
    providerWebhookEvents.off(
      PROVIDER_WEBHOOK_EVENT.FAILED,
      failed
    );
    providerWebhookEvents.off(
      PROVIDER_WEBHOOK_EVENT.RECONCILIATION_COMPLETED,
      reconciliationCompleted
    );
  };
}

module.exports = {
  initializeProviderWebhookEventBridge,
};
