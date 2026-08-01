const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/financialClose.controller');
const schema = require('../validators/financialClose.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/', controller.list);
router.post('/', validateRequest(schema.startCloseSchema), controller.start);

router.patch(
  '/tasks/:taskId/complete',
  validateRequest(schema.taskParams, 'params'),
  validateRequest(schema.completeTaskSchema),
  controller.completeTask
);

router.post(
  '/:closeCycleId/trial-balance',
  validateRequest(schema.closeCycleParams, 'params'),
  validateRequest(schema.trialBalanceSchema),
  controller.generateBalance
);

router.get(
  '/trial-balance/:snapshotId',
  validateRequest(schema.snapshotParams, 'params'),
  controller.getBalance
);

router.patch(
  '/:closeCycleId/complete',
  validateRequest(schema.closeCycleParams, 'params'),
  controller.complete
);

module.exports = router;
