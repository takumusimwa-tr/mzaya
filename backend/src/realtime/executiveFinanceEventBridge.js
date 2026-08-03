const {
  executiveFinanceEvents,
  EXECUTIVE_FINANCE_EVENT,
} = require('../events/executiveFinance.events');

function initializeExecutiveFinanceEventBridge(io) {
  const kpiReady = (payload) => {
    io.to('admins').emit('executive_finance:kpi_snapshot_ready', payload);
  };

  const alertRaised = (payload) => {
    io.to('admins').emit('executive_finance:kpi_alert_raised', payload);
  };

  const packReady = (payload) => {
    io.to('admins').emit('executive_finance:reporting_pack_ready', payload);
  };

  executiveFinanceEvents.on(
    EXECUTIVE_FINANCE_EVENT.KPI_SNAPSHOT_READY,
    kpiReady
  );
  executiveFinanceEvents.on(
    EXECUTIVE_FINANCE_EVENT.KPI_ALERT_RAISED,
    alertRaised
  );
  executiveFinanceEvents.on(
    EXECUTIVE_FINANCE_EVENT.REPORTING_PACK_READY,
    packReady
  );

  return () => {
    executiveFinanceEvents.off(
      EXECUTIVE_FINANCE_EVENT.KPI_SNAPSHOT_READY,
      kpiReady
    );
    executiveFinanceEvents.off(
      EXECUTIVE_FINANCE_EVENT.KPI_ALERT_RAISED,
      alertRaised
    );
    executiveFinanceEvents.off(
      EXECUTIVE_FINANCE_EVENT.REPORTING_PACK_READY,
      packReady
    );
  };
}

module.exports = {
  initializeExecutiveFinanceEventBridge,
};
