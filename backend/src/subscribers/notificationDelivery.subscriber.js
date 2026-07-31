const {
  notificationEvents,
  NOTIFICATION_EVENT,
} = require('../events/notification.events');
const {
  processDelivery,
  queuePendingDeliveries,
} = require('../services/notificationQueue.service');

let initialized = false;
let handlers = null;

function initializeNotificationDeliverySubscriber() {
  if (initialized) return;

  handlers = {
    created: ({ notification }) => {
      queuePendingDeliveries(notification.id).catch((error) => {
        console.error('notification_delivery_queue_failed', {
          message: error.message,
          notificationId: notification.id,
        });
      });
    },

    queued: ({ deliveryId }) => {
      processDelivery(deliveryId).catch((error) => {
        console.error('notification_delivery_process_failed', {
          message: error.message,
          deliveryId,
        });
      });
    },
  };

  notificationEvents.on(NOTIFICATION_EVENT.CREATED, handlers.created);
  notificationEvents.on(
    NOTIFICATION_EVENT.DELIVERY_QUEUED,
    handlers.queued
  );

  initialized = true;
}

function closeNotificationDeliverySubscriber() {
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
  initializeNotificationDeliverySubscriber,
  closeNotificationDeliverySubscriber,
};
