const { EventEmitter } = require('events');

const executiveFinanceEvents = new EventEmitter();
executiveFinanceEvents.setMaxListeners(50);

const EXECUTIVE_FINANCE_EVENT = Object.freeze({
  KPI_SNAPSHOT_READY: 'executive_finance:kpi_snapshot_ready',
  KPI_ALERT_RAISED: 'executive_finance:kpi_alert_raised',
  REPORTING_PACK_READY: 'executive_finance:reporting_pack_ready',
  REPORTING_PACK_APPROVED: 'executive_finance:reporting_pack_approved',
});

module.exports = {
  executiveFinanceEvents,
  EXECUTIVE_FINANCE_EVENT,
};
