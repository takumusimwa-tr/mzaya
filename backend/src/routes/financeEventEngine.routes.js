const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/financeEventEngine.controller');
const schema = require('../validators/financeEvent.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/', validateRequest(schema.listQuery, 'query'), controller.list);
router.post('/', validateRequest(schema.ingestEvent), controller.ingest);

router.post(
  '/:businessEventId/process',
  validateRequest(schema.eventParams, 'params'),
  controller.process
);

router.get(
  '/:businessEventId/timeline',
  validateRequest(schema.eventParams, 'params'),
  controller.timeline
);

module.exports = router;
