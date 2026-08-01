const Joi = require('joi');

const sessionParamsSchema = Joi.object({
  sessionId: Joi.string().uuid().required(),
});

const attachmentParamsSchema = Joi.object({
  attachmentId: Joi.string().uuid().required(),
});

const createUploadSessionSchema = Joi.object({
  conversationId: Joi.string().uuid().required(),
  filename: Joi.string().trim().max(255).required(),
  mimeType: Joi.string().trim().max(120).required(),
  byteSize: Joi.number().integer().min(1).required(),
  metadata: Joi.object().default({}),
}).unknown(false);

const finalizeAttachmentSchema = Joi.object({
  clientMessageId: Joi.string().trim().max(120).required(),
  caption: Joi.string().trim().max(2000).allow(null, ''),
  durationMs: Joi.number().integer().min(300).max(600000).allow(null),
  waveform: Joi.array()
    .items(Joi.number().min(0).max(1))
    .max(120)
    .allow(null),
}).unknown(false);

module.exports = {
  sessionParamsSchema,
  attachmentParamsSchema,
  createUploadSessionSchema,
  finalizeAttachmentSchema,
};
