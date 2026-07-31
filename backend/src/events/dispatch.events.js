const { EventEmitter } = require('events');

const dispatchEvents = new EventEmitter();
dispatchEvents.setMaxListeners(30);

const DISPATCH_EVENT = Object.freeze({
  OFFER_CREATED: 'dispatch:offer_created',
  OFFER_EXPIRED: 'dispatch:offer_expired',
  OFFER_DECLINED: 'dispatch:offer_declined',
  OFFER_ACCEPTED: 'dispatch:offer_accepted',
});

module.exports = { dispatchEvents, DISPATCH_EVENT };
