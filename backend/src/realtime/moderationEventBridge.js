const { moderationEvents, MODERATION_EVENT } = require('../events/moderation.events');

function initializeModerationEventBridge(io) {
  const reportCreated = (payload) => io.to('admins').emit('moderation:report_created', payload);
  const reportResolved = (payload) => io.to('admins').emit('moderation:report_resolved', payload);
  const actionApplied = (payload) => {
    io.to(`conversation:${payload.conversationId}`).emit('moderation:action_applied', payload);
    io.to('admins').emit('moderation:action_applied', payload);
  };

  moderationEvents.on(MODERATION_EVENT.REPORT_CREATED, reportCreated);
  moderationEvents.on(MODERATION_EVENT.REPORT_RESOLVED, reportResolved);
  moderationEvents.on(MODERATION_EVENT.ACTION_APPLIED, actionApplied);

  return () => {
    moderationEvents.off(MODERATION_EVENT.REPORT_CREATED, reportCreated);
    moderationEvents.off(MODERATION_EVENT.REPORT_RESOLVED, reportResolved);
    moderationEvents.off(MODERATION_EVENT.ACTION_APPLIED, actionApplied);
  };
}

module.exports = { initializeModerationEventBridge };
