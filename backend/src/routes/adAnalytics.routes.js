const router = require('express').Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const analytics = require('../controllers/adAnalytics.controller');

router.use(authenticate);
router.post('/events', analytics.record);
router.get('/summary', requireRole(USER_ROLE.VENDOR, USER_ROLE.ADMIN), analytics.summary);
module.exports = router;
