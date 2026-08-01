const { TreasuryTransferAudit } = require('../models/associations');

async function recordTreasuryTransferAudit({
  transferId,
  actorId = null,
  action,
  previousValue = null,
  newValue = null,
  metadata = {},
  transaction,
}) {
  return TreasuryTransferAudit.create({
    treasury_transfer_id: transferId,
    actor_id: actorId,
    action,
    previous_value: previousValue,
    new_value: newValue,
    metadata,
  }, { transaction });
}

module.exports = { recordTreasuryTransferAudit };
