const {
  finalizeAttachmentMessage,
  getAuthorizedAttachment,
} = require('../services/attachment.service');

async function finalize(req, res, next) {
  try {
    const message = await finalizeAttachmentMessage({
      sessionId: req.params.sessionId,
      userId: req.user.id,
      clientMessageId: req.body.clientMessageId,
      caption: req.body.caption,
      durationMs: req.body.durationMs,
      waveform: req.body.waveform,
    });

    return res.status(201).json({ message });
  } catch (error) {
    return next(error);
  }
}

async function getDownload(req, res, next) {
  try {
    const result = await getAuthorizedAttachment({
      attachmentId: req.params.attachmentId,
      userId: req.user.id,
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  finalize,
  getDownload,
};
