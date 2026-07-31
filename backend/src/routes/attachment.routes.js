const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validateRequest');
const uploadController = require('../controllers/upload.controller');
const attachmentController = require('../controllers/attachment.controller');
const {
  sessionParamsSchema,
  attachmentParamsSchema,
  createUploadSessionSchema,
  finalizeAttachmentSchema,
} = require('../validators/attachment.validator');

router.use(authenticate);

router.post(
  '/uploads',
  validateRequest(createUploadSessionSchema, 'body'),
  uploadController.createSession
);

router.put(
  '/uploads/:sessionId/content',
  validateRequest(sessionParamsSchema, 'params'),
  express.raw({
    type: '*/*',
    limit: '25mb',
  }),
  uploadController.putContent
);

router.post(
  '/uploads/:sessionId/finalize',
  validateRequest(sessionParamsSchema, 'params'),
  validateRequest(finalizeAttachmentSchema, 'body'),
  attachmentController.finalize
);

router.get(
  '/:attachmentId/download',
  validateRequest(attachmentParamsSchema, 'params'),
  attachmentController.getDownload
);

module.exports = router;
