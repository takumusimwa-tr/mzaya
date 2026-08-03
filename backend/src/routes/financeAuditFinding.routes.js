const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/financeAuditFinding.controller');
const schema = require('../validators/financeAudit.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get(
  '/',
  validateRequest(schema.listQuery, 'query'),
  controller.list
);
router.post(
  '/',
  validateRequest(schema.createFinding),
  controller.create
);

module.exports = router;
