const { EventEmitter } = require('events');

const attachmentEvents = new EventEmitter();
attachmentEvents.setMaxListeners(50);

const ATTACHMENT_EVENT = Object.freeze({
  SESSION_CREATED: 'attachment:session_created',
  UPLOAD_COMPLETED: 'attachment:upload_completed',
  PROCESSING_COMPLETED: 'attachment:processing_completed',
  PROCESSING_FAILED: 'attachment:processing_failed',
});

module.exports = {
  attachmentEvents,
  ATTACHMENT_EVENT,
};
