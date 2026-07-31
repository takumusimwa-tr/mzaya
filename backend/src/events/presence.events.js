const { EventEmitter } = require('events');
const presenceEvents = new EventEmitter();
presenceEvents.setMaxListeners(50);
const PRESENCE_EVENT = Object.freeze({ CHANGED: 'presence:changed' });
module.exports = { presenceEvents, PRESENCE_EVENT };