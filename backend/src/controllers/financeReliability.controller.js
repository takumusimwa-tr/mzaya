const {
  FinanceReliabilitySnapshot,
  FinanceConsumerOffset,
} = require('../models/associations');
const {
  buildReliabilitySnapshot,
} = require('../services/financeReliability.service');

async function dashboard(req, res, next) {
  try {
    const [snapshots, consumers] = await Promise.all([
      FinanceReliabilitySnapshot.findAll({
        order: [['snapshot_at', 'DESC']],
        limit: 100,
      }),
      FinanceConsumerOffset.findAll({
        order: [['consumer_key', 'ASC']],
      }),
    ]);

    return res.status(200).json({
      snapshots,
      consumers,
    });
  } catch (error) {
    return next(error);
  }
}

async function snapshot(req, res, next) {
  try {
    const result = await buildReliabilitySnapshot({
      sourceSystem: req.body.sourceSystem || null,
    });
    return res.status(201).json({ snapshot: result });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  dashboard,
  snapshot,
};
