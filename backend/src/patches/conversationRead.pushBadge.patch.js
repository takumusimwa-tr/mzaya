const {
  clearUnread,
} = require('../services/chatNotificationState.service');

/*
 * Call after markConversationRead succeeds:
 */
async function clearConversationBadge({
  conversationId,
  userId,
}) {
  return clearUnread({
    conversationId,
    userId,
  });
}

module.exports = {
  clearConversationBadge,
};
