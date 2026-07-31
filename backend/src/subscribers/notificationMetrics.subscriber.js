const {
  notificationEvents,
  NOTIFICATION_EVENT,
} = require('../events/notification.events');
const {
  incrementNotificationMetric,
} = require('../services/notificationMetrics.service');

let initialized = false;
let handlers = null;

function initializeNotificationMetricsSubscriber() {
  if (initialized) return;

  handlers = {
    created: () => incrementNotificationMetric('created'),
    queued: () => incrementNotificationMetric('retried'),
  };

  notificationEvents.on(NOTIFICATION_EVENT.CREATED, handlers.created);
  notificationEvents.on(
    NOTIFICATION_EVENT.DELIVERY_QUEUED,
    handlers.queued
  );

  initialized = true;
}

function closeNotificationMetricsSubscriber() {
  if (!initialized || !handlers) return;

  notificationEvents.off(NOTIFICATION_EVENT.CREATED, handlers.created);
  notificationEvents.off(
    NOTIFICATION_EVENT.DELIVERY_QUEUED,
    handlers.queued
  );

  handlers = null;
  initialized = false;
}

module.exports = {
  initializeNotificationMetricsSubscriber,
  closeNotificationMetricsSubscriber,
};
