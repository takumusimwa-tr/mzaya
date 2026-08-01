const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/bankStatementImport.controller');
const schemas = require('../validators/bankStatementImport.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get(
  '/',
  validateRequest(schemas.importQuerySchema, 'query'),
  controller.list
);

router.post(
  '/',
  validateRequest(schemas.createImportSchema),
  controller.create
);

module.exports = router;
