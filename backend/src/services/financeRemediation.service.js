const crypto = require('crypto');
const {
  FinanceRemediationAction,
  FinanceAuditFinding,
} = require('../models/associations');
const {
  financeAuditEvents,
  FINANCE_AUDIT_EVENT,
} = require('../events/financeAudit.events');

async function createRemediationAction({
  findingId,
  actionTitle,
  actionDescription = null,
  ownerId,
  dueDate,
}) {
  return FinanceRemediationAction.create({
    finding_id: findingId,
    action_reference: `REM-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
    action_title: actionTitle,
    action_description: actionDescription,
    owner_id: ownerId,
    due_date: dueDate,
  });
}

async function completeRemediation({
  remediationId,
  completedBy,
  completionEvidence,
}) {
  const action = await FinanceRemediationAction.findByPk(remediationId);
  if (!action) {
    const error = new Error('Remediation action not found');
    error.status = 404;
    throw error;
  }

  await action.update({
    status: 'completed_pending_verification',
    completion_evidence: completionEvidence || {},
    completed_by: completedBy,
    completed_at: new Date(),
  });

  return action;
}

async function verifyRemediation({
  remediationId,
  verifiedBy,
  verificationNotes,
}) {
  const action = await FinanceRemediationAction.findByPk(remediationId);
  if (!action) {
    const error = new Error('Remediation action not found');
    error.status = 404;
    throw error;
  }

  if (String(action.completed_by) === String(verifiedBy)) {
    const error = new Error('Completer cannot verify the same remediation');
    error.status = 403;
    error.code = 'MAKER_CHECKER_VIOLATION';
    throw error;
  }

  await action.update({
    status: 'verified',
    verified_by: verifiedBy,
    verified_at: new Date(),
    verification_notes: verificationNotes,
  });

  const openActions = await FinanceRemediationAction.count({
    where: {
      finding_id: action.finding_id,
      status: ['open', 'in_progress', 'completed_pending_verification'],
    },
  });

  if (openActions === 0) {
    await FinanceAuditFinding.update({
      status: 'closed',
      closed_by: verifiedBy,
      closed_at: new Date(),
    }, {
      where: { id: action.finding_id },
    });
  }

  financeAuditEvents.emit(
    FINANCE_AUDIT_EVENT.REMEDIATION_VERIFIED,
    { remediationId: action.id, findingId: action.finding_id }
  );

  return action;
}

module.exports = {
  createRemediationAction,
  completeRemediation,
  verifyRemediation,
};
