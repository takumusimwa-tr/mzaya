const { RefundAudit } = require('../models/associations');

async function recordRefundAudit({
  refundId,
  actorId,
  action,
  previousValue = null,
  newValue = null,
  metadata = {},
  transaction,
}) {
  return RefundAudit.create({
    refund_id: refundId,
    actor_id: actorId,
    action,
    previous_value: previousValue,
    new_value: newValue,
    metadata,
  }, { transaction });
}

module.exports = { recordRefundAudit };
