const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/fxDeal.controller');
const schema = require('../validators/treasuryExecution.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/', controller.list);
router.post('/', validateRequest(schema.createFxDeal), controller.create);

router.patch(
  '/:dealId/settle',
  validateRequest(schema.dealParams, 'params'),
  validateRequest(schema.settleFxDeal),
  controller.settle
);

module.exports = router;
