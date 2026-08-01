const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/paymentBatch.controller');
const { paymentBatchBody } = require('../validators/treasury.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/', controller.list);
router.post('/', validateRequest(paymentBatchBody), controller.create);

module.exports = router;
