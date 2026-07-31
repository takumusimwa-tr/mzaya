const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/pushDevice.controller');
const {
  registerDeviceSchema,
  deactivateDeviceSchema,
} = require('../validators/pushDevice.validator');

router.use(authenticate);

router.post(
  '/devices',
  validateRequest(registerDeviceSchema, 'body'),
  controller.register
);

router.delete(
  '/devices',
  validateRequest(deactivateDeviceSchema, 'body'),
  controller.deactivate
);

router.get('/unread-count', controller.unreadCount);

module.exports = router;
