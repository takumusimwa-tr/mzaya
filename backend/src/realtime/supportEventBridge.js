const {
  supportEvents,
  SUPPORT_EVENT,
} = require('../events/support.events');

function initializeSupportEventBridge(io) {
  const listeners = {
    created: (payload) => {
      io.to('support:queue').emit('support:ticket_created', payload);
      io.to(`user:${payload.customerId}`).emit(
        'support:ticket_updated',
        payload
      );
    },

    assigned: (payload) => {
      io.to('support:queue').emit('support:ticket_assigned', payload);
      io.to(`user:${payload.agentId}`).emit(
        'support:ticket_assigned',
        payload
      );
    },

    escalated: (payload) => {
      io.to('support:queue').emit('support:ticket_escalated', payload);
      io.to(`conversation:${payload.conversationId}`).emit(
        'support:ticket_escalated',
        payload
      );
    },

    statusChanged: (payload) => {
      io.to('support:queue').emit(
        'support:ticket_status_changed',
        payload
      );
      io.to(`conversation:${payload.conversationId}`).emit(
        'support:ticket_status_changed',
        payload
      );
    },

    noteCreated: (payload) => {
      io.to(`support:ticket:${payload.ticketId}`).emit(
        'support:note_created',
        payload
      );
    },
  };

  supportEvents.on(SUPPORT_EVENT.TICKET_CREATED, listeners.created);
  supportEvents.on(SUPPORT_EVENT.TICKET_ASSIGNED, listeners.assigned);
  supportEvents.on(SUPPORT_EVENT.TICKET_ESCALATED, listeners.escalated);
  supportEvents.on(
    SUPPORT_EVENT.TICKET_STATUS_CHANGED,
    listeners.statusChanged
  );
  supportEvents.on(SUPPORT_EVENT.NOTE_CREATED, listeners.noteCreated);

  return () => {
    supportEvents.off(SUPPORT_EVENT.TICKET_CREATED, listeners.created);
    supportEvents.off(SUPPORT_EVENT.TICKET_ASSIGNED, listeners.assigned);
    supportEvents.off(SUPPORT_EVENT.TICKET_ESCALATED, listeners.escalated);
    supportEvents.off(
      SUPPORT_EVENT.TICKET_STATUS_CHANGED,
      listeners.statusChanged
    );
    supportEvents.off(SUPPORT_EVENT.NOTE_CREATED, listeners.noteCreated);
  };
}

function registerSupportSocket(socket) {
  if (!['support', 'admin'].includes(socket.user.role)) return;

  socket.join('support:queue');

  socket.on('support:ticket_join', ({ ticketId }) => {
    socket.join(`support:ticket:${ticketId}`);
  });

  socket.on('support:ticket_leave', ({ ticketId }) => {
    socket.leave(`support:ticket:${ticketId}`);
  });
}

module.exports = {
  initializeSupportEventBridge,
  registerSupportSocket,
};
