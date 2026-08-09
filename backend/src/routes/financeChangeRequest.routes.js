const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/financeChangeRequest.controller');
const schema = require('../validators/financeMasterData.validator');
router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));
router.get('/', validateRequest(schema.changeListQuery, 'query'), controller.list);
router.post('/', validateRequest(schema.createChangeRequestSchema), controller.create);
router.post('/:changeRequestId/decision',
  validateRequest(schema.changeRequestParams, 'params'),
  validateRequest(schema.decisionSchema), controller.decide);
module.exports = router;
