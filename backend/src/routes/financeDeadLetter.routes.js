const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/financeDeadLetter.controller');
const schema = require('../validators/financeDelivery.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get(
  '/',
  validateRequest(schema.listQuery, 'query'),
  controller.list
);

router.post(
  '/:deadLetterId/replay',
  validateRequest(schema.deadLetterParams, 'params'),
  controller.replay
);

module.exports = router;
