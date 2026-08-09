const { EventEmitter } = require('events');
const financeMasterDataEvents = new EventEmitter();
financeMasterDataEvents.setMaxListeners(50);

const FINANCE_MASTER_DATA_EVENT = Object.freeze({
  CHANGE_SUBMITTED: 'finance_master_data:change_submitted',
  CHANGE_APPROVED: 'finance_master_data:change_approved',
  CHANGE_REJECTED: 'finance_master_data:change_rejected',
  VERSION_ACTIVATED: 'finance_master_data:version_activated',
  QUALITY_ISSUE: 'finance_master_data:quality_issue',
  PERIOD_LOCK_CHANGED: 'finance_master_data:period_lock_changed',
});

module.exports = { financeMasterDataEvents, FINANCE_MASTER_DATA_EVENT };
