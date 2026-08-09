const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/financeReplay.controller');
const schema = require('../validators/financeEvent.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/', validateRequest(schema.listQuery, 'query'), controller.list);

router.post(
  '/:businessEventId',
  validateRequest(schema.eventParams, 'params'),
  validateRequest(schema.replayBody),
  controller.queue
);

module.exports = router;
