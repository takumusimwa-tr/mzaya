const {
  createConversation,
  getConversationById,
  listConversations,
  sendMessage,
  listMessages,
  markConversationRead,
} = require('../services/conversation.service');

async function create(req, res, next) {
  try {
    const conversation = await createConversation({
      createdBy: req.user.id,
      type: req.body.type,
      orderId: req.body.orderId,
      title: req.body.title,
      metadata: req.body.metadata,
      participants: req.body.participants,
    });

    return res.status(201).json({ conversation });
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const result = await listConversations({
      userId: req.user.id,
      cursor: req.query.cursor,
      limit: req.query.limit,
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getOne(req, res, next) {
  try {
    const conversation = await getConversationById(
      req.params.conversationId,
      req.user.id
    );

    return res.status(200).json({ conversation });
  } catch (error) {
    return next(error);
  }
}

async function createMessage(req, res, next) {
  try {
    const message = await sendMessage({
      conversationId: req.params.conversationId,
      senderId: req.user.id,
      clientMessageId: req.body.clientMessageId,
      type: req.body.type,
      body: req.body.body,
      metadata: req.body.metadata,
      replyToMessageId: req.body.replyToMessageId,
    });

    return res.status(201).json({ message });
  } catch (error) {
    return next(error);
  }
}

async function listConversationMessages(req, res, next) {
  try {
    const result = await listMessages({
      conversationId: req.params.conversationId,
      userId: req.user.id,
      cursor: req.query.cursor,
      limit: req.query.limit,
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function markRead(req, res, next) {
  try {
    const result = await markConversationRead({
      conversationId: req.params.conversationId,
      userId: req.user.id,
      messageId: req.body.messageId,
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  create,
  list,
  getOne,
  createMessage,
  listConversationMessages,
  markRead,
};
