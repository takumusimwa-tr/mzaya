const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/fx.controller');
const { listQuery } = require('../validators/treasuryRisk.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/rates', validateRequest(listQuery, 'query'), controller.rates);
router.get('/exposures', validateRequest(listQuery, 'query'), controller.exposures);

module.exports = router;
