const storage = require('../storage');
const {
  createUploadSession,
  getOwnedUploadSession,
  markUploaded,
} = require('../services/uploadSession.service');

async function createSession(req, res, next) {
  try {
    const session = await createUploadSession({
      userId: req.user.id,
      conversationId: req.body.conversationId,
      filename: req.body.filename,
      mimeType: req.body.mimeType,
      byteSize: req.body.byteSize,
      metadata: req.body.metadata,
    });

    return res.status(201).json({
      session,
      upload: {
        method: 'PUT',
        url: `/api/attachments/uploads/${session.id}/content`,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function putContent(req, res, next) {
  try {
    const session = await getOwnedUploadSession({
      sessionId: req.params.sessionId,
      userId: req.user.id,
    });

    if (!Buffer.isBuffer(req.body)) {
      const error = new Error('Raw upload body required');
      error.status = 400;
      throw error;
    }

    await storage.putBuffer({
      key: session.storage_key,
      buffer: req.body,
      contentType: session.mime_type,
    });

    const updated = await markUploaded({
      sessionId: session.id,
      userId: req.user.id,
      uploadedSize: req.body.length,
    });

    return res.status(200).json({ session: updated });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createSession,
  putContent,
};
