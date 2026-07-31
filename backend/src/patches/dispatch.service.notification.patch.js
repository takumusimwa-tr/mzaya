/**
 * Apply these focused changes to Batch 06.3 dispatch.service.js.
 *
 * Import:
 *
 * const {
 *   dispatchEvents,
 *   DISPATCH_EVENT,
 * } = require('../events/dispatch.events');
 *
 * After DispatchOffer.create(...) succeeds:
 *
 * dispatchEvents.emit(DISPATCH_EVENT.OFFER_CREATED, {
 *   order,
 *   offer,
 * });
 *
 * When an expired offer is marked expired:
 *
 * const order = await Order.findByPk(offer.order_id);
 * if (order) {
 *   dispatchEvents.emit(DISPATCH_EVENT.OFFER_EXPIRED, {
 *     order,
 *     offer,
 *   });
 * }
 *
 * When a rider declines:
 *
 * dispatchEvents.emit(DISPATCH_EVENT.OFFER_DECLINED, {
 *   order,
 *   offer,
 * });
 *
 * When a rider accepts:
 *
 * transaction.afterCommit(() => {
 *   dispatchEvents.emit(DISPATCH_EVENT.OFFER_ACCEPTED, {
 *     order,
 *     offer,
 *   });
 * });
 */
