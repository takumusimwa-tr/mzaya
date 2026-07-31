const {
  SettlementAudit,
} = require('../models/associations');

async function recordSettlementAudit({
  settlementId = null,
  batchId = null,
  actorId = null,
  action,
  previousValue = null,
  newValue = null,
  metadata = {},
  transaction,
}) {
  return SettlementAudit.create({
    settlement_id: settlementId,
    batch_id: batchId,
    actor_id: actorId,
    action,
    previous_value: previousValue,
    new_value: newValue,
    metadata,
  }, { transaction });
}

module.exports = {
  recordSettlementAudit,
};
