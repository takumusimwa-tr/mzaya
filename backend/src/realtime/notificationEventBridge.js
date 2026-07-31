const {
  notificationEvents,
  NOTIFICATION_EVENT,
} = require('../events/notification.events');
const { userRoom } = require('./rooms');

let initialized = false;
let handlers = null;

function initializeNotificationEventBridge(io) {
  if (initialized) return;

  handlers = {
    created: ({ notification }) => {
      io.to(userRoom(notification.user_id)).emit(
        'notification:new',
        notification
      );
    },
    read: (payload) => {
      io.to(userRoom(payload.userId)).emit('notification:read', payload);
    },
    readAll: (payload) => {
      io.to(userRoom(payload.userId)).emit(
        'notification:read_all',
        payload
      );
    },
    archived: (payload) => {
      io.to(userRoom(payload.userId)).emit(
        'notification:archived',
        payload
      );
    },
  };

  notificationEvents.on(NOTIFICATION_EVENT.CREATED, handlers.created);
  notificationEvents.on(NOTIFICATION_EVENT.READ, handlers.read);
  notificationEvents.on(NOTIFICATION_EVENT.READ_ALL, handlers.readAll);
  notificationEvents.on(NOTIFICATION_EVENT.ARCHIVED, handlers.archived);
  initialized = true;
}

function closeNotificationEventBridge() {
  if (!initialized || !handlers) return;

  notificationEvents.off(NOTIFICATION_EVENT.CREATED, handlers.created);
  notificationEvents.off(NOTIFICATION_EVENT.READ, handlers.read);
  notificationEvents.off(NOTIFICATION_EVENT.READ_ALL, handlers.readAll);
  notificationEvents.off(NOTIFICATION_EVENT.ARCHIVED, handlers.archived);
  handlers = null;
  initialized = false;
}

module.exports = {
  initializeNotificationEventBridge,
  closeNotificationEventBridge,
};
