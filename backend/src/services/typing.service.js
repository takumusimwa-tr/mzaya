const activeTyping = new Map();
const TTL = 6000;
const key = (conversationId, userId) => `${conversationId}:${userId}`;
function startTyping({ conversationId, userId }) { const expiresAt = Date.now() + TTL; activeTyping.set(key(conversationId, userId), expiresAt); return { conversationId, userId, typing: true, expiresAt }; }
function stopTyping({ conversationId, userId }) { activeTyping.delete(key(conversationId, userId)); return { conversationId, userId, typing: false }; }
module.exports = { startTyping, stopTyping };