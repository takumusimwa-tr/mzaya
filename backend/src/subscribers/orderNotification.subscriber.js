const {
  orderEvents,
  ORDER_EVENT,
} = require('../events/order.events');
const { Order } = require('../models/associations');
const {
  notifyMany,
} = require('../services/notificationOrchestrator.service');
const {
  resolveOrderRecipients,
} = require('../services/notificationRecipient.service');

let initialized = false;
let handlers = null;

const CUSTOMER_EVENTS = new Set([
  'confirmed',
  'preparing',
  'ready',
  'rider_assigned',
  'accepted',
  'picked_up',
  'en_route',
  'delivered',
  'cancelled',
]);

async function handleStatusChanged(payload) {
  const order = await Order.findByPk(payload.orderId);
  if (!order) return;

  const recipients = await resolveOrderRecipients(order);
  const eventKey = `order.${payload.toStatus}`;

  const filtered = recipients.filter(({ audience }) => {
    if (audience === 'customer') return CUSTOMER_EVENTS.has(payload.toStatus);
    if (audience === 'vendor') return payload.toStatus === 'cancelled';
    return false;
  });

  if (!filtered.length) return;

  await notifyMany({
    recipients: filtered,
    eventKey,
    context: { order },
  });
}

function initializeOrderNotificationSubscriber() {
  if (initialized) return;

  handlers = {
    statusChanged: (payload) => {
      handleStatusChanged(payload).catch((error) => {
        console.error('order_notification_subscriber_failed', {
          message: error.message,
          orderId: payload.orderId,
        });
      });
    },
  };

  orderEvents.on(ORDER_EVENT.STATUS_CHANGED, handlers.statusChanged);
  initialized = true;
}

function closeOrderNotificationSubscriber() {
  if (!initialized || !handlers) return;

  orderEvents.off(ORDER_EVENT.STATUS_CHANGED, handlers.statusChanged);
  handlers = null;
  initialized = false;
}

module.exports = {
  initializeOrderNotificationSubscriber,
  closeOrderNotificationSubscriber,
  handleStatusChanged,
};
