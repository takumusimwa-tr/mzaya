const { SupportTicketAudit } = require('../models/associations');

async function recordSupportAudit({
  ticketId,
  actorId = null,
  action,
  previousValue = null,
  newValue = null,
  metadata = {},
  transaction,
}) {
  return SupportTicketAudit.create({
    ticket_id: ticketId,
    actor_id: actorId,
    action,
    previous_value: previousValue,
    new_value: newValue,
    metadata,
  }, { transaction });
}

module.exports = {
  recordSupportAudit,
};
