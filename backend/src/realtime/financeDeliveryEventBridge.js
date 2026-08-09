const {
  financeDeliveryEvents,
  FINANCE_DELIVERY_EVENT,
} = require('../events/financeDelivery.events');

function initializeFinanceDeliveryEventBridge(io) {
  const listeners = Object.values(FINANCE_DELIVERY_EVENT).map((eventName) => {
    const listener = (payload) => {
      io.to('admins').emit(eventName, payload);
    };

    financeDeliveryEvents.on(eventName, listener);
    return [eventName, listener];
  });

  return () => {
    listeners.forEach(([eventName, listener]) => {
      financeDeliveryEvents.off(eventName, listener);
    });
  };
}

module.exports = {
  initializeFinanceDeliveryEventBridge,
};
