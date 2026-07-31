const router = require('express').Router();
const {
  authenticate,
  requireRole,
} = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/financeReport.controller');
const {
  exportJobSchema,
  exportJobParamsSchema,
} = require('../validators/financeDashboard.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.post(
  '/exports',
  validateRequest(exportJobSchema),
  controller.createExport
);

router.get(
  '/exports/:jobId',
  validateRequest(exportJobParamsSchema, 'params'),
  controller.getExport
);

module.exports = router;
