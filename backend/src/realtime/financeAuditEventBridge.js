const {
  financeAuditEvents,
  FINANCE_AUDIT_EVENT,
} = require('../events/financeAudit.events');

function initializeFinanceAuditEventBridge(io) {
  const findingRaised = (payload) => {
    io.to('admins').emit('finance_audit:finding_raised', payload);
  };

  const remediationOverdue = (payload) => {
    io.to('admins').emit('finance_audit:remediation_overdue', payload);
  };

  const assessmentCompleted = (payload) => {
    io.to('admins').emit('finance_audit:assessment_completed', payload);
  };

  financeAuditEvents.on(
    FINANCE_AUDIT_EVENT.FINDING_RAISED,
    findingRaised
  );
  financeAuditEvents.on(
    FINANCE_AUDIT_EVENT.REMEDIATION_OVERDUE,
    remediationOverdue
  );
  financeAuditEvents.on(
    FINANCE_AUDIT_EVENT.ASSESSMENT_COMPLETED,
    assessmentCompleted
  );

  return () => {
    financeAuditEvents.off(
      FINANCE_AUDIT_EVENT.FINDING_RAISED,
      findingRaised
    );
    financeAuditEvents.off(
      FINANCE_AUDIT_EVENT.REMEDIATION_OVERDUE,
      remediationOverdue
    );
    financeAuditEvents.off(
      FINANCE_AUDIT_EVENT.ASSESSMENT_COMPLETED,
      assessmentCompleted
    );
  };
}

module.exports = { initializeFinanceAuditEventBridge };
