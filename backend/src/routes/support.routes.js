const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const { validateRequest } = require('../middleware/validateRequest');
const controller = require('../controllers/support.controller');
const {
  ticketIdParamsSchema,
  createTicketSchema,
  listQueueSchema,
  assignTicketSchema,
  updateTicketSchema,
  internalNoteSchema,
} = require('../validators/support.validator');

router.use(authenticate);

router.post(
  '/tickets',
  validateRequest(createTicketSchema, 'body'),
  controller.create
);

router.get(
  '/tickets',
  authorize('support', 'admin'),
  validateRequest(listQueueSchema, 'query'),
  controller.list
);

router.get(
  '/tickets/:ticketId',
  validateRequest(ticketIdParamsSchema, 'params'),
  controller.getOne
);

router.patch(
  '/tickets/:ticketId/assign',
  authorize('support', 'admin'),
  validateRequest(ticketIdParamsSchema, 'params'),
  validateRequest(assignTicketSchema, 'body'),
  controller.assign
);

router.patch(
  '/tickets/:ticketId',
  authorize('support', 'admin'),
  validateRequest(ticketIdParamsSchema, 'params'),
  validateRequest(updateTicketSchema, 'body'),
  controller.update
);

router.post(
  '/tickets/:ticketId/notes',
  authorize('support', 'admin'),
  validateRequest(ticketIdParamsSchema, 'params'),
  validateRequest(internalNoteSchema, 'body'),
  controller.createNote
);

module.exports = router;
