const {
  MessageAttachment,
} = require('../models/associations');
const {
  attachmentEvents,
  ATTACHMENT_EVENT,
} = require('../events/attachment.events');

async function processAttachment({
  attachmentId,
  scanner,
  metadataReader,
}) {
  const attachment = await MessageAttachment.findByPk(attachmentId);
  if (!attachment) return null;

  try {
    const scanResult = await scanner.scan(attachment.storage_key);

    if (!scanResult.clean) {
      await attachment.update({
        scan_status: 'infected',
        status: 'blocked',
      });
      return attachment;
    }

    const metadata = await metadataReader.read({
      key: attachment.storage_key,
      mimeType: attachment.mime_type,
    });

    await attachment.update({
      scan_status: 'clean',
      status: 'ready',
      width: metadata.width || null,
      height: metadata.height || null,
      duration_ms: metadata.durationMs || attachment.duration_ms,
      metadata: {
        ...attachment.metadata,
        processedAt: new Date().toISOString(),
      },
    });

    attachmentEvents.emit(ATTACHMENT_EVENT.PROCESSING_COMPLETED, {
      attachmentId: attachment.id,
      messageId: attachment.message_id,
    });

    return attachment;
  } catch (error) {
    await attachment.update({
      status: 'failed',
      metadata: {
        ...attachment.metadata,
        processingError: error.message,
      },
    });

    attachmentEvents.emit(ATTACHMENT_EVENT.PROCESSING_FAILED, {
      attachmentId: attachment.id,
      messageId: attachment.message_id,
      error: error.message,
    });

    throw error;
  }
}

module.exports = {
  processAttachment,
};
