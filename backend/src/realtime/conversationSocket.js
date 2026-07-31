const {
  assertParticipant,
} = require('../services/conversation.service');

function registerConversationSocket(io, socket) {
  socket.on('conversation:join', async ({ conversationId }, acknowledge) => {
    try {
      await assertParticipant(conversationId, socket.user.id);
      await socket.join(`conversation:${conversationId}`);
      acknowledge?.({ ok: true, conversationId });
    } catch (error) {
      acknowledge?.({
        ok: false,
        error: error.code || 'CONVERSATION_JOIN_FAILED',
      });
    }
  });

  socket.on('conversation:leave', async ({ conversationId }) => {
    await socket.leave(`conversation:${conversationId}`);
  });
}

module.exports = {
  registerConversationSocket,
};
