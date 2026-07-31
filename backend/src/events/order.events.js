const { EventEmitter } = require('events');

const orderEvents = new EventEmitter();
orderEvents.setMaxListeners(50);

const ORDER_EVENT = Object.freeze({
  STATUS_CHANGED: 'order.status.changed',
});

function emitOrderStatusChanged(payload) {
  orderEvents.emit(ORDER_EVENT.STATUS_CHANGED, payload);
}

module.exports = { ORDER_EVENT, orderEvents, emitOrderStatusChanged };
