const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/invoice.controller');
const { createInvoiceSchema } = require('../validators/taxCompliance.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/', controller.list);

router.post(
  '/',
  validateRequest(createInvoiceSchema),
  controller.create
);

module.exports = router;
