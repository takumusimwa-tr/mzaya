const { EventEmitter } = require('events');

const notificationEvents = new EventEmitter();
notificationEvents.setMaxListeners(50);

const NOTIFICATION_EVENT = Object.freeze({
  CREATED: 'notification:created',
  READ: 'notification:read',
  READ_ALL: 'notification:read_all',
  ARCHIVED: 'notification:archived',
  DELIVERY_QUEUED: 'notification:delivery_queued',
});

module.exports = { notificationEvents, NOTIFICATION_EVENT };
