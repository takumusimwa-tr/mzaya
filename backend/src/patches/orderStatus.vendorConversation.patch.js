const {
  syncOrderStatusMessage,
} = require('../services/orderConversation.service');

/*
 * Call this after the order transaction commits.
 * Preserve the existing order-status workflow and treat chat sync as a
 * non-blocking integration step.
 */
async function publishOrderStatusToConversation({
  orderId,
  status,
  actorId,
  customerFacingText,
  logger,
}) {
  try {
    await syncOrderStatusMessage({
      orderId,
      status,
      actorId,
      text: customerFacingText,
    });
  } catch (error) {
    logger?.warn?.('Order conversation status sync failed', {
      orderId,
      status,
      error: error.message,
    });
  }
}

module.exports = {
  publishOrderStatusToConversation,
};
