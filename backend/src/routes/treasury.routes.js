const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/treasury.controller');
const schema = require('../validators/treasury.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.get('/accounts', controller.accounts);
router.get('/liquidity', validateRequest(schema.liquidityQuery, 'query'), controller.liquidity);
router.get('/liquidity/trend', validateRequest(schema.trendQuery, 'query'), controller.trend);

module.exports = router;
