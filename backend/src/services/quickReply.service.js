const {
  VendorQuickReply,
} = require('../models/associations');
const {
  sendMessage,
} = require('./conversation.service');
const {
  vendorConversationEvents,
  VENDOR_CONVERSATION_EVENT,
} = require('../events/vendorConversation.events');

function serviceError(message, status = 400, code = 'QUICK_REPLY_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

async function listQuickReplies(vendorId) {
  return VendorQuickReply.findAll({
    where: {
      vendor_id: vendorId,
      is_active: true,
    },
    order: [
      ['sort_order', 'ASC'],
      ['created_at', 'ASC'],
    ],
  });
}

async function createQuickReply({
  vendorId,
  createdBy,
  label,
  message,
  category = 'general',
  sortOrder = 0,
}) {
  return VendorQuickReply.create({
    vendor_id: vendorId,
    created_by: createdBy,
    label,
    message,
    category,
    sort_order: sortOrder,
  });
}

async function updateQuickReply({
  quickReplyId,
  vendorId,
  changes,
}) {
  const reply = await VendorQuickReply.findOne({
    where: {
      id: quickReplyId,
      vendor_id: vendorId,
    },
  });

  if (!reply) {
    throw serviceError('Quick reply not found', 404, 'QUICK_REPLY_NOT_FOUND');
  }

  return reply.update(changes);
}

async function archiveQuickReply({
  quickReplyId,
  vendorId,
}) {
  return updateQuickReply({
    quickReplyId,
    vendorId,
    changes: { is_active: false },
  });
}

async function sendQuickReply({
  quickReplyId,
  conversationId,
  vendorId,
  clientMessageId,
}) {
  const reply = await VendorQuickReply.findOne({
    where: {
      id: quickReplyId,
      vendor_id: vendorId,
      is_active: true,
    },
  });

  if (!reply) {
    throw serviceError('Quick reply not found', 404, 'QUICK_REPLY_NOT_FOUND');
  }

  const message = await sendMessage({
    conversationId,
    senderId: vendorId,
    clientMessageId,
    type: 'text',
    body: reply.message,
    metadata: {
      source: 'vendor_quick_reply',
      quickReplyId: reply.id,
      category: reply.category,
    },
  });

  vendorConversationEvents.emit(
    VENDOR_CONVERSATION_EVENT.QUICK_REPLY_SENT,
    {
      conversationId,
      vendorId,
      quickReplyId: reply.id,
      messageId: message.id,
    }
  );

  return message;
}

module.exports = {
  listQuickReplies,
  createQuickReply,
  updateQuickReply,
  archiveQuickReply,
  sendQuickReply,
};
