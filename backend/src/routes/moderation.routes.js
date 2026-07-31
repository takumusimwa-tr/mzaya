const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/moderation.controller');
const schemas = require('../validators/moderation.validator');

router.use(authenticate);

router.post(
  '/messages/:messageId/report',
  validateRequest(schemas.messageIdParamsSchema, 'params'),
  validateRequest(schemas.createReportSchema),
  controller.createReport
);

router.get(
  '/reports',
  requireRole(USER_ROLE.ADMIN),
  validateRequest(schemas.listReportsSchema, 'query'),
  controller.list
);

router.patch(
  '/reports/:reportId',
  requireRole(USER_ROLE.ADMIN),
  validateRequest(schemas.reportIdParamsSchema, 'params'),
  validateRequest(schemas.resolveReportSchema),
  controller.resolve
);

router.post(
  '/conversations/:conversationId/actions',
  requireRole(USER_ROLE.ADMIN),
  validateRequest(schemas.conversationIdParamsSchema, 'params'),
  validateRequest(schemas.applyActionSchema),
  controller.applyAction
);

module.exports = router;
