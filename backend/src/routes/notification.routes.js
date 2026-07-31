const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
  list,
  unreadCount,
  readOne,
  readAll,
  archive,
} = require('../controllers/notification.controller');
const {
  notificationIdParamsSchema,
  listNotificationsQuerySchema,
} = require('../validators/notification.validator');

router.use(authenticate);

router.get(
  '/',
  validateRequest(listNotificationsQuerySchema, 'query'),
  list
);

router.get('/unread-count', unreadCount);
router.patch('/read-all', readAll);

router.patch(
  '/:notificationId/read',
  validateRequest(notificationIdParamsSchema, 'params'),
  readOne
);

router.delete(
  '/:notificationId',
  validateRequest(notificationIdParamsSchema, 'params'),
  archive
);

module.exports = router;
