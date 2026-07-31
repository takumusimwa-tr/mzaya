const { ComplianceAuditLog } = require('../models/associations');

async function recordComplianceAudit({
  actorId = null,
  action,
  resourceType,
  resourceId = null,
  previousValue = null,
  newValue = null,
  metadata = {},
  transaction,
}) {
  return ComplianceAuditLog.create({
    actor_id: actorId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    previous_value: previousValue,
    new_value: newValue,
    metadata,
  }, { transaction });
}

module.exports = { recordComplianceAudit };
