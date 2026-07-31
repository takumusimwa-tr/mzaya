/**
 * Apply this after an order is created successfully.
 *
 * const {
 *   notifyMany,
 * } = require('../services/notificationOrchestrator.service');
 * const {
 *   resolveOrderRecipients,
 * } = require('../services/notificationRecipient.service');
 *
 * transaction.afterCommit(async () => {
 *   const recipients = await resolveOrderRecipients(order);
 *
 *   await notifyMany({
 *     recipients: recipients.filter(({ audience }) =>
 *       ['customer', 'vendor'].includes(audience)
 *     ),
 *     eventKey: recipients.some(({ audience }) => audience === 'vendor')
 *       ? 'vendor.new_order'
 *       : 'order.placed',
 *     context: { order },
 *   });
 * });
 *
 * Recommended production integration:
 * create two explicit calls so the customer receives `order.placed` and the
 * vendor receives `vendor.new_order`.
 */
