const crypto = require('crypto');
const {
  FinanceAuditFinding,
} = require('../models/associations');
const {
  financeAuditEvents,
  FINANCE_AUDIT_EVENT,
} = require('../events/financeAudit.events');

async function createAuditFinding({
  engagementId,
  assessmentId = null,
  title,
  description,
  rootCause = null,
  impact = null,
  severity,
  riskRating,
  recurrenceKey = null,
  ownerId = null,
  targetDate = null,
  createdBy,
  metadata = {},
}) {
  const recurrenceCount = recurrenceKey
    ? await FinanceAuditFinding.count({ where: { recurrence_key: recurrenceKey } })
    : 0;

  const finding = await FinanceAuditFinding.create({
    engagement_id: engagementId,
    assessment_id: assessmentId,
    finding_reference: `FND-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
    title,
    description,
    root_cause: rootCause,
    impact,
    severity,
    risk_rating: riskRating,
    recurrence_key: recurrenceKey,
    owner_id: ownerId,
    target_date: targetDate,
    created_by: createdBy,
    metadata: {
      ...metadata,
      recurrenceCount,
      recurring: recurrenceCount > 0,
    },
  });

  financeAuditEvents.emit(
    FINANCE_AUDIT_EVENT.FINDING_RAISED,
    {
      findingId: finding.id,
      severity,
      recurring: recurrenceCount > 0,
    }
  );

  return finding;
}

module.exports = { createAuditFinding };
