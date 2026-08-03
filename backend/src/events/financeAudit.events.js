const { EventEmitter } = require('events');

const financeAuditEvents = new EventEmitter();
financeAuditEvents.setMaxListeners(50);

const FINANCE_AUDIT_EVENT = Object.freeze({
  ASSESSMENT_COMPLETED: 'finance_audit:assessment_completed',
  FINDING_RAISED: 'finance_audit:finding_raised',
  REMEDIATION_OVERDUE: 'finance_audit:remediation_overdue',
  REMEDIATION_VERIFIED: 'finance_audit:remediation_verified',
  EVIDENCE_COLLECTED: 'finance_audit:evidence_collected',
});

module.exports = {
  financeAuditEvents,
  FINANCE_AUDIT_EVENT,
};
