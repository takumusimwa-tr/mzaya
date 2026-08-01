const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/budget.controller');
const schema = require('../validators/budgeting.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/', controller.list);
router.post('/', validateRequest(schema.createBudget), controller.create);

router.patch(
  '/versions/:budgetVersionId/approve',
  validateRequest(schema.budgetVersionParams, 'params'),
  controller.approve
);

module.exports = router;
