const {
  notificationEvents,
  NOTIFICATION_EVENT,
} = require('../events/notification.events');
const {
  notifyRecipient,
} = require('../services/notificationOrchestrator.service');

let initialized = false;
let dispatchEmitter = null;
let handlers = null;

function initializeDispatchNotificationSubscriber(emitter) {
  if (initialized || !emitter) return;

  dispatchEmitter = emitter;

  handlers = {
    offerCreated: async ({ order, offer }) => {
      try {
        await notifyRecipient({
          userId: offer.rider_id,
          audience: 'rider',
          eventKey: 'dispatch.offer_created',
          context: { order, offer },
        });
      } catch (error) {
        console.error('dispatch_offer_notification_failed', {
          message: error.message,
          orderId: order.id,
          offerId: offer.id,
        });
      }
    },

    offerExpired: async ({ order, offer }) => {
      try {
        await notifyRecipient({
          userId: offer.rider_id,
          audience: 'rider',
          eventKey: 'dispatch.offer_expired',
          context: { order, offer },
        });
      } catch (error) {
        console.error('dispatch_expiry_notification_failed', {
          message: error.message,
          orderId: order.id,
          offerId: offer.id,
        });
      }
    },
  };

  emitter.on('dispatch:offer_created', handlers.offerCreated);
  emitter.on('dispatch:offer_expired', handlers.offerExpired);
  initialized = true;
}

function closeDispatchNotificationSubscriber() {
  if (!initialized || !dispatchEmitter || !handlers) return;

  dispatchEmitter.off('dispatch:offer_created', handlers.offerCreated);
  dispatchEmitter.off('dispatch:offer_expired', handlers.offerExpired);
  dispatchEmitter = null;
  handlers = null;
  initialized = false;
}

module.exports = {
  initializeDispatchNotificationSubscriber,
  closeDispatchNotificationSubscriber,
};
