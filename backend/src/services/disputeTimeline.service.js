const { DisputeTimeline } = require('../models/associations');

async function appendDisputeTimeline({
  disputeId,
  actorId = null,
  eventType,
  body = null,
  metadata = {},
  transaction,
}) {
  return DisputeTimeline.create({
    dispute_id: disputeId,
    actor_id: actorId,
    event_type: eventType,
    body,
    metadata,
  }, { transaction });
}

module.exports = { appendDisputeTimeline };
