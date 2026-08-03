const crypto = require('crypto');
const {
  FinanceAuditEvidence,
} = require('../models/associations');
const {
  financeAuditEvents,
  FINANCE_AUDIT_EVENT,
} = require('../events/financeAudit.events');

function hashEvidenceContent(content) {
  return crypto
    .createHash('sha256')
    .update(Buffer.isBuffer(content) ? content : String(content || ''))
    .digest('hex');
}

async function registerAuditEvidence({
  engagementId = null,
  procedureId = null,
  assessmentId = null,
  evidenceType,
  title,
  sourceType = null,
  sourceId = null,
  storageKey = null,
  contentHash = null,
  confidentiality = 'internal',
  retentionUntil = null,
  collectedBy,
  metadata = {},
}) {
  const evidence = await FinanceAuditEvidence.create({
    engagement_id: engagementId,
    procedure_id: procedureId,
    assessment_id: assessmentId,
    evidence_reference: `EVD-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
    evidence_type: evidenceType,
    title,
    source_type: sourceType,
    source_id: sourceId,
    storage_key: storageKey,
    content_hash: contentHash,
    confidentiality,
    retention_until: retentionUntil,
    collected_by: collectedBy,
    metadata,
  });

  financeAuditEvents.emit(
    FINANCE_AUDIT_EVENT.EVIDENCE_COLLECTED,
    { evidenceId: evidence.id }
  );

  return evidence;
}

module.exports = {
  hashEvidenceContent,
  registerAuditEvidence,
};
