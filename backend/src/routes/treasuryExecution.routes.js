const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/treasuryExecution.controller');
const { transferParams } = require('../validators/treasuryExecution.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.patch(
  '/:transferId/approve',
  validateRequest(transferParams, 'params'),
  controller.approve
);

router.post(
  '/:transferId/execute',
  validateRequest(transferParams, 'params'),
  controller.execute
);

module.exports = router;
