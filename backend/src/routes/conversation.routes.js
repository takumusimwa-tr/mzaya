const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/conversation.controller');
const {
  createConversationSchema,
  conversationIdParamsSchema,
  listQuerySchema,
  createMessageSchema,
  markReadSchema,
} = require('../validators/conversation.validator');

router.use(authenticate);

router.get(
  '/',
  validateRequest(listQuerySchema, 'query'),
  controller.list
);

router.post(
  '/',
  validateRequest(createConversationSchema, 'body'),
  controller.create
);

router.get(
  '/:conversationId',
  validateRequest(conversationIdParamsSchema, 'params'),
  controller.getOne
);

router.get(
  '/:conversationId/messages',
  validateRequest(conversationIdParamsSchema, 'params'),
  validateRequest(listQuerySchema, 'query'),
  controller.listConversationMessages
);

router.post(
  '/:conversationId/messages',
  validateRequest(conversationIdParamsSchema, 'params'),
  validateRequest(createMessageSchema, 'body'),
  controller.createMessage
);

router.patch(
  '/:conversationId/read',
  validateRequest(conversationIdParamsSchema, 'params'),
  validateRequest(markReadSchema, 'body'),
  controller.markRead
);

module.exports = router;
