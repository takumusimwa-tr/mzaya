const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/treasuryTransfer.controller');
const schema = require('../validators/treasuryRisk.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/', validateRequest(schema.listQuery, 'query'), controller.list);
router.post('/', validateRequest(schema.createTransfer), controller.create);

module.exports = router;
