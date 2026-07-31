const {
  attachmentEvents,
  ATTACHMENT_EVENT,
} = require('../events/attachment.events');

function initializeAttachmentEventBridge(io) {
  const completed = (payload) => {
    io.emit('attachment:processing_completed', payload);
  };

  const failed = (payload) => {
    io.emit('attachment:processing_failed', payload);
  };

  attachmentEvents.on(
    ATTACHMENT_EVENT.PROCESSING_COMPLETED,
    completed
  );
  attachmentEvents.on(
    ATTACHMENT_EVENT.PROCESSING_FAILED,
    failed
  );

  return () => {
    attachmentEvents.off(
      ATTACHMENT_EVENT.PROCESSING_COMPLETED,
      completed
    );
    attachmentEvents.off(
      ATTACHMENT_EVENT.PROCESSING_FAILED,
      failed
    );
  };
}

module.exports = {
  initializeAttachmentEventBridge,
};
