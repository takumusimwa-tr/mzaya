const mlService = require('../services/ml.service');

// GET /api/analytics/model-metrics
async function modelMetrics(req, res) {
  const data = await mlService.getModelMetrics();
  if (!data) return res.status(503).json({ error: 'ML service unavailable' });
  return res.status(200).json(data);
}

// GET /api/analytics/spending-trends
async function spendingTrends(req, res) {
  const { city } = req.query;
  const data = await mlService.getSpendingTrends(city);
  if (!data) return res.status(503).json({ error: 'ML service unavailable' });
  return res.status(200).json(data);
}

// GET /api/analytics/anomalies
async function anomalies(req, res) {
  const { limit } = req.query;
  const data = await mlService.getAnomalies(limit || 50);
  if (!data) return res.status(503).json({ error: 'ML service unavailable' });
  return res.status(200).json(data);
}

// POST /api/analytics/train  (admin only)
async function trainModel(req, res) {
  const data = await mlService.trainModel();
  if (!data) return res.status(503).json({ error: 'ML service unavailable' });
  return res.status(200).json(data);
}

module.exports = { modelMetrics, spendingTrends, anomalies, trainModel };