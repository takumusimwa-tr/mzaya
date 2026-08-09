const {
  financeEventEngineEvents,
  FINANCE_EVENT_ENGINE_EVENT,
} = require('../events/financeEventEngine.events');

function initializeFinanceEventBridge(io) {
  const listeners = Object.values(FINANCE_EVENT_ENGINE_EVENT).map((eventName) => {
    const listener = (payload) => {
      io.to('admins').emit(eventName, payload);
    };

    financeEventEngineEvents.on(eventName, listener);
    return [eventName, listener];
  });

  return () => {
    listeners.forEach(([eventName, listener]) => {
      financeEventEngineEvents.off(eventName, listener);
    });
  };
}

module.exports = {
  initializeFinanceEventBridge,
};
