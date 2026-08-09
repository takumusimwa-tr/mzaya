const {
  FinanceBusinessEvent,
  FinanceAccountingEvent,
  FinanceIntegrationLog,
} = require('../models/associations');
const {
  ingestBusinessEvent,
  processBusinessEvent,
} = require('../services/financeEventEngine.service');

async function list(req, res, next) {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.eventType) where.event_type = req.query.eventType;

    const events = await FinanceBusinessEvent.findAll({
      where,
      include: [{
        model: FinanceAccountingEvent,
        as: 'accountingEvent',
        required: false,
      }],
      order: [['received_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });

    return res.status(200).json({ events });
  } catch (error) {
    return next(error);
  }
}

async function ingest(req, res, next) {
  try {
    const event = await ingestBusinessEvent(req.body);
    return res.status(201).json({ event });
  } catch (error) {
    return next(error);
  }
}

async function process(req, res, next) {
  try {
    const event = await processBusinessEvent({
      businessEventId: req.params.businessEventId,
    });
    return res.status(200).json({ event });
  } catch (error) {
    return next(error);
  }
}

async function timeline(req, res, next) {
  try {
    const logs = await FinanceIntegrationLog.findAll({
      where: { business_event_id: req.params.businessEventId },
      order: [['occurred_at', 'ASC']],
    });
    return res.status(200).json({ logs });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  ingest,
  process,
  timeline,
};
