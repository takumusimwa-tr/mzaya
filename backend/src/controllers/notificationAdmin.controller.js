const {
  listDeliveryHealth,
  retryDelivery,
  getNotificationHealthSummary,
} = require('../services/notificationAdmin.service');

async function healthSummary(req, res, next) {
  try {
    const summary = await getNotificationHealthSummary();
    return res.status(200).json({ summary });
  } catch (error) {
    return next(error);
  }
}

async function listDeliveries(req, res, next) {
  try {
    const result = await listDeliveryHealth({
      status: req.query.status,
      channel: req.query.channel,
      limit: req.query.limit,
      cursor: req.query.cursor,
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function retry(req, res, next) {
  try {
    const delivery = await retryDelivery(req.params.deliveryId);
    return res.status(200).json({ delivery });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  healthSummary,
  listDeliveries,
  retry,
};
