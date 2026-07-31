const crypto = require('crypto');
const { Op } = require('sequelize');
const { UploadSession } = require('../models/associations');
const { assertParticipant } = require('./conversation.service');
const {
  validateUploadDeclaration,
} = require('./mediaValidation.service');
const {
  attachmentEvents,
  ATTACHMENT_EVENT,
} = require('../events/attachment.events');

function serviceError(message, status = 400, code = 'UPLOAD_SESSION_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

async function createUploadSession({
  userId,
  conversationId,
  filename,
  mimeType,
  byteSize,
  metadata = {},
}) {
  await assertParticipant(conversationId, userId);

  const validated = validateUploadDeclaration({
    filename,
    mimeType,
    byteSize,
  });

  const storageKey = [
    'chat',
    conversationId,
    new Date().toISOString().slice(0, 10),
    `${crypto.randomUUID()}-${validated.normalizedName}`,
  ].join('/');

  const session = await UploadSession.create({
    user_id: userId,
    conversation_id: conversationId,
    storage_key: storageKey,
    original_name: filename,
    normalized_name: validated.normalizedName,
    mime_type: mimeType,
    declared_size: validated.byteSize,
    status: 'pending',
    expires_at: new Date(Date.now() + 30 * 60 * 1000),
    metadata: {
      ...metadata,
      mediaKind: validated.mediaKind,
    },
  });

  attachmentEvents.emit(ATTACHMENT_EVENT.SESSION_CREATED, {
    sessionId: session.id,
    conversationId,
    userId,
  });

  return session;
}

async function getOwnedUploadSession({ sessionId, userId }) {
  const session = await UploadSession.findOne({
    where: { id: sessionId, user_id: userId },
  });

  if (!session) {
    throw serviceError('Upload session not found', 404, 'UPLOAD_SESSION_NOT_FOUND');
  }

  if (session.expires_at <= new Date()) {
    throw serviceError('Upload session expired', 410, 'UPLOAD_SESSION_EXPIRED');
  }

  return session;
}

async function markUploaded({
  sessionId,
  userId,
  uploadedSize,
}) {
  const session = await getOwnedUploadSession({ sessionId, userId });

  if (Number(uploadedSize) !== Number(session.declared_size)) {
    throw serviceError(
      'Uploaded file size does not match declaration',
      409,
      'UPLOAD_SIZE_MISMATCH'
    );
  }

  await session.update({
    uploaded_size: uploadedSize,
    status: 'uploaded',
  });

  attachmentEvents.emit(ATTACHMENT_EVENT.UPLOAD_COMPLETED, {
    sessionId: session.id,
    conversationId: session.conversation_id,
    userId,
  });

  return session;
}

async function listExpiredSessions() {
  return UploadSession.findAll({
    where: {
      status: { [Op.in]: ['pending', 'failed', 'cancelled'] },
      expires_at: { [Op.lt]: new Date() },
    },
  });
}

module.exports = {
  createUploadSession,
  getOwnedUploadSession,
  markUploaded,
  listExpiredSessions,
};
