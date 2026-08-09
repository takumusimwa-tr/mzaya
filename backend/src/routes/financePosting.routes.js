const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/financePosting.controller');
const { batchBody } = require('../validators/financeEvent.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/dashboard', controller.dashboard);
router.post('/batches', validateRequest(batchBody), controller.createBatch);

module.exports = router;
