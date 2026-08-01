const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/financialControl.controller');
const schema = require('../validators/financialControl.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));
router.get('/policies', controller.policies);
router.get('/approvals', controller.approvals);
router.post('/approvals', validateRequest(schema.request), controller.request);
router.post('/approvals/:approvalRequestId/decision', validateRequest(schema.decision), controller.decide);
router.get('/exceptions', controller.exceptions);
router.patch('/exceptions/:exceptionId/resolve', validateRequest(schema.resolve), controller.resolveException);

module.exports = router;
