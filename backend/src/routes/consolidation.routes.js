const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/consolidation.controller');
const schema = require('../validators/consolidation.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/groups', controller.groups);
router.get('/runs', validateRequest(schema.listQuery, 'query'), controller.runs);
router.post('/runs', validateRequest(schema.startConsolidation), controller.start);

module.exports = router;
