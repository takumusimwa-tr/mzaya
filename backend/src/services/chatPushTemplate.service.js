function truncate(value, max = 120) {
  const text = String(value || '').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function buildMessagePush({
  message,
  conversation,
  sender,
  unreadCount,
}) {
  const senderName = [
    sender?.first_name,
    sender?.last_name,
  ].filter(Boolean).join(' ') || 'Mzaya';

  const isAttachment = ['attachment', 'voice', 'image'].includes(message.type);

  return {
    title: senderName,
    body: isAttachment
      ? 'Sent an attachment'
      : truncate(message.body || 'New message'),
    data: {
      type: 'conversation_message',
      conversationId: conversation.id,
      messageId: message.id,
      route: `/messages/${conversation.id}`,
    },
    badge: unreadCount,
    collapseKey: `conversation:${conversation.id}`,
  };
}

module.exports = {
  truncate,
  buildMessagePush,
};
