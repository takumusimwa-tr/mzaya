/**
 * MZAYA internal event-to-socket bridge.
 *
 * Starts once at server boot and keeps the lifecycle service independent from
 * Socket.IO.
 */
const { ORDER_EVENT, orderEvents } = require('../events/order.events');
const { Order } = require('../models/associations');
const { publishOrderStatusChanged } = require('./orderPublisher');
const { resolveOrderVendorId } = require('../middleware/ownership.middleware');
const { logger } = require('../utils/logger');

let started = false;
let statusListener = null;

function startOrderEventBridge() {
  if (started) return;
  started = true;

  statusListener = async (event) => {
    try {
      const order = await Order.findByPk(event.orderId);
      if (!order) {
        logger.warn('realtime_order_missing', { orderId: event.orderId });
        return;
      }
      const vendorId = await resolveOrderVendorId(order.id);
      publishOrderStatusChanged(order, { ...event, vendorId });
    } catch (error) {
      logger.error('order_event_bridge_error', {
        orderId: event.orderId,
        error: error.message,
      });
    }
  };

  orderEvents.on(ORDER_EVENT.STATUS_CHANGED, statusListener);
}

function stopOrderEventBridge() {
  if (!started || !statusListener) return;
  orderEvents.off(ORDER_EVENT.STATUS_CHANGED, statusListener);
  statusListener = null;
  started = false;
}

module.exports = { startOrderEventBridge, stopOrderEventBridge };
