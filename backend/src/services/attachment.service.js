const { sequelize } = require('../config/db');
const {
  UploadSession,
  MessageAttachment,
  Message,
} = require('../models/associations');
const storage = require('../storage');
const {
  sendMessage,
  assertParticipant,
} = require('./conversation.service');

function serviceError(message, status = 400, code = 'ATTACHMENT_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

async function finalizeAttachmentMessage({
  sessionId,
  userId,
  clientMessageId,
  caption = null,
  durationMs = null,
  waveform = null,
}) {
  return sequelize.transaction(async (transaction) => {
    const session = await UploadSession.findOne({
      where: { id: sessionId, user_id: userId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!session) {
      throw serviceError('Upload session not found', 404, 'UPLOAD_SESSION_NOT_FOUND');
    }

    if (session.status !== 'uploaded') {
      throw serviceError(
        'Upload is not ready to attach',
        409,
        'UPLOAD_NOT_READY'
      );
    }

    await assertParticipant(session.conversation_id, userId);

    const existing = await Message.findOne({
      where: {
        sender_id: userId,
        client_message_id: clientMessageId,
      },
      transaction,
    });

    if (existing) return existing;

    const message = await sendMessage({
      conversationId: session.conversation_id,
      senderId: userId,
      clientMessageId,
      type: session.metadata.mediaKind === 'audio' ? 'voice' : 'attachment',
      body: caption,
      metadata: {
        mediaKind: session.metadata.mediaKind,
      },
    });

    await MessageAttachment.create({
      message_id: message.id,
      upload_session_id: session.id,
      storage_key: session.storage_key,
      original_name: session.original_name,
      mime_type: session.mime_type,
      media_kind: session.metadata.mediaKind,
      byte_size: session.declared_size,
      duration_ms: durationMs,
      waveform,
      scan_status: 'pending',
      status: 'processing',
    }, { transaction });

    await session.update({ status: 'attached' }, { transaction });

    return message;
  });
}

async function getAuthorizedAttachment({
  attachmentId,
  userId,
}) {
  const attachment = await MessageAttachment.findByPk(attachmentId, {
    include: [{
      model: Message,
      as: 'message',
      attributes: ['id', 'conversation_id'],
    }],
  });

  if (!attachment) {
    throw serviceError('Attachment not found', 404, 'ATTACHMENT_NOT_FOUND');
  }

  await assertParticipant(attachment.message.conversation_id, userId);

  if (attachment.status !== 'ready' || attachment.scan_status !== 'clean') {
    throw serviceError(
      'Attachment is not available',
      423,
      'ATTACHMENT_NOT_READY'
    );
  }

  const url = await storage.createReadUrl(attachment.storage_key);

  return {
    attachment,
    url,
  };
}

module.exports = {
  finalizeAttachmentMessage,
  getAuthorizedAttachment,
};
