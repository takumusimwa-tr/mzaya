const {
  ProviderWebhookEvent,
  ReconciliationRun,
} = require('../models/associations');
const {
  processWebhookEvent,
} = require('../services/providerWebhookProcessor.service');

async function listEvents(req, res, next) {
  try {
    const where = {};
    if (req.query.provider) where.provider = req.query.provider;
    if (req.query.status) where.status = req.query.status;

    const events = await ProviderWebhookEvent.findAll({
      where,
      order: [['received_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 50, 200),
    });

    return res.status(200).json({ events });
  } catch (error) {
    return next(error);
  }
}

async function retryEvent(req, res, next) {
  try {
    const event = await processWebhookEvent(req.params.eventId);
    return res.status(200).json({ event });
  } catch (error) {
    return next(error);
  }
}

async function listReconciliationRuns(req, res, next) {
  try {
    const runs = await ReconciliationRun.findAll({
      order: [['created_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 50, 200),
    });

    return res.status(200).json({ runs });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listEvents,
  retryEvent,
  listReconciliationRuns,
};
