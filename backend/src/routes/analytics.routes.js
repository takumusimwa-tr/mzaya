const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const {
  modelMetrics, spendingTrends, anomalies, trainModel
} = require('../controllers/analytics.controller');

// All analytics require authentication
router.use(authenticate);

// Available to admin and vendors
router.get('/model-metrics',    requireRole(USER_ROLE.ADMIN, USER_ROLE.VENDOR), modelMetrics);
router.get('/spending-trends',  requireRole(USER_ROLE.ADMIN, USER_ROLE.VENDOR), spendingTrends);
router.get('/anomalies',        requireRole(USER_ROLE.ADMIN), anomalies);

// Admin only — trigger model retraining
router.post('/train',           requireRole(USER_ROLE.ADMIN), trainModel);

module.exports = router;