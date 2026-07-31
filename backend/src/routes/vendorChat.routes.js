const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validateRequest');
const vendorController = require('../controllers/vendorChat.controller');
const quickReplyController = require('../controllers/quickReply.controller');
const {
  orderIdParamsSchema,
  quickReplyIdParamsSchema,
  listQuerySchema,
  ensureConversationSchema,
  quickReplyCreateSchema,
  quickReplyUpdateSchema,
  quickReplySendSchema,
} = require('../validators/vendorChat.validator');

router.use(authenticate);

router.get(
  '/conversations',
  validateRequest(listQuerySchema, 'query'),
  vendorController.list
);

router.get(
  '/orders/:orderId/conversation',
  validateRequest(orderIdParamsSchema, 'params'),
  vendorController.getByOrder
);

router.post(
  '/orders/:orderId/conversation',
  validateRequest(orderIdParamsSchema, 'params'),
  validateRequest(ensureConversationSchema, 'body'),
  vendorController.ensure
);

router.get('/quick-replies', quickReplyController.list);

router.post(
  '/quick-replies',
  validateRequest(quickReplyCreateSchema, 'body'),
  quickReplyController.create
);

router.patch(
  '/quick-replies/:quickReplyId',
  validateRequest(quickReplyIdParamsSchema, 'params'),
  validateRequest(quickReplyUpdateSchema, 'body'),
  quickReplyController.update
);

router.delete(
  '/quick-replies/:quickReplyId',
  validateRequest(quickReplyIdParamsSchema, 'params'),
  quickReplyController.archive
);

router.post(
  '/quick-replies/:quickReplyId/send',
  validateRequest(quickReplyIdParamsSchema, 'params'),
  validateRequest(quickReplySendSchema, 'body'),
  quickReplyController.send
);

module.exports = router;
