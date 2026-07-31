const Joi=require('joi');
const conversationIdParamsSchema=Joi.object({conversationId:Joi.string().uuid().required()});
const chatQuerySchema=Joi.object({cursor:Joi.date().iso(),limit:Joi.number().integer().min(1).max(100).default(50)}).unknown(false);
const sendMessageSchema=Joi.object({clientMessageId:Joi.string().trim().max(100).required(),type:Joi.string().valid('text','image','location').default('text'),body:Joi.string().trim().max(5000).allow(null,''),metadata:Joi.object().default({}),replyToMessageId:Joi.string().uuid().allow(null)}).unknown(false);
const markReadSchema=Joi.object({messageId:Joi.string().uuid().required()}).unknown(false);
module.exports={conversationIdParamsSchema,chatQuerySchema,sendMessageSchema,markReadSchema};