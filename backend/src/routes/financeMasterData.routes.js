const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/financeMasterData.controller');
const schema = require('../validators/financeMasterData.validator');
router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));
router.get('/dashboard', controller.dashboard);
router.post('/records', validateRequest(schema.createRecord), controller.createRecord);
router.post('/period-locks', validateRequest(schema.periodLockSchema), controller.lockPeriod);
router.patch('/period-locks/:periodLockId/unlock',
  validateRequest(schema.periodLockParams, 'params'), controller.unlockPeriodAction);
module.exports = router;
