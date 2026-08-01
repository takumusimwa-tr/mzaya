const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/liquidityForecast.controller');
const { createForecast } = require('../validators/treasuryExecution.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/scenarios', controller.scenarios);
router.get('/', controller.list);
router.post('/', validateRequest(createForecast), controller.create);

module.exports = router;
