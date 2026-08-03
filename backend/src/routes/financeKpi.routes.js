const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/financeKpi.controller');
const schema = require('../validators/executiveFinance.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/definitions', controller.definitions);
router.get(
  '/snapshots',
  validateRequest(schema.listQuery, 'query'),
  controller.snapshots
);
router.post(
  '/snapshots',
  validateRequest(schema.snapshotBody),
  controller.createSnapshot
);
router.get(
  '/:kpiKey/trend',
  validateRequest(schema.kpiParams, 'params'),
  validateRequest(schema.trendQuery, 'query'),
  controller.trend
);

module.exports = router;
