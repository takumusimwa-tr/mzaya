const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// ─── Extract features for a new order ────────────────────────────────────────
// Called automatically after every order is created
async function extractFeatures(order) {
  try {
    const response = await axios.post(`${ML_URL}/features/extract`, { order });
    return response.data;
  } catch (err) {
    // Non-blocking — if ML service is down, order still succeeds
    console.error('[ML] Feature extraction failed:', err.message);
    return null;
  }
}

// ─── Score a single order for anomalies ──────────────────────────────────────
async function scoreOrder(order) {
  try {
    const response = await axios.post(`${ML_URL}/anomaly/score`, { order });
    return response.data;
  } catch (err) {
    console.error('[ML] Anomaly scoring failed:', err.message);
    return null;
  }
}

// ─── Get model metrics ────────────────────────────────────────────────────────
async function getModelMetrics() {
  try {
    const response = await axios.get(`${ML_URL}/analytics/model-metrics`);
    return response.data;
  } catch (err) {
    console.error('[ML] Model metrics failed:', err.message);
    return null;
  }
}

// ─── Get spending trends ──────────────────────────────────────────────────────
async function getSpendingTrends(city = null) {
  try {
    const params = city ? { city } : {};
    const response = await axios.get(`${ML_URL}/analytics/spending-trends`, { params });
    return response.data;
  } catch (err) {
    console.error('[ML] Spending trends failed:', err.message);
    return null;
  }
}

// ─── Get anomaly list ─────────────────────────────────────────────────────────
async function getAnomalies(limit = 50) {
  try {
    const response = await axios.get(`${ML_URL}/anomaly/list`, { params: { limit } });
    return response.data;
  } catch (err) {
    console.error('[ML] Anomaly list failed:', err.message);
    return null;
  }
}

// ─── Trigger model training ───────────────────────────────────────────────────
async function trainModel() {
  try {
    const response = await axios.post(`${ML_URL}/anomaly/train`);
    return response.data;
  } catch (err) {
    console.error('[ML] Model training failed:', err.message);
    return null;
  }
}

module.exports = {
  extractFeatures,
  scoreOrder,
  getModelMetrics,
  getSpendingTrends,
  getAnomalies,
  trainModel,
};