const { TaxReturnAudit } = require('../models/associations');

async function recordTaxReturnAudit({
  taxReturnId,
  actorId = null,
  action,
  previousValue = null,
  newValue = null,
  metadata = {},
  transaction,
}) {
  return TaxReturnAudit.create({
    tax_return_id: taxReturnId,
    actor_id: actorId,
    action,
    previous_value: previousValue,
    new_value: newValue,
    metadata,
  }, { transaction });
}

module.exports = { recordTaxReturnAudit };
