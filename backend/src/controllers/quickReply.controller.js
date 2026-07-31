const {
  listQuickReplies,
  createQuickReply,
  updateQuickReply,
  archiveQuickReply,
  sendQuickReply,
} = require('../services/quickReply.service');

async function list(req, res, next) {
  try {
    const quickReplies = await listQuickReplies(req.user.id);
    return res.status(200).json({ quickReplies });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const quickReply = await createQuickReply({
      vendorId: req.user.id,
      createdBy: req.user.id,
      label: req.body.label,
      message: req.body.message,
      category: req.body.category,
      sortOrder: req.body.sortOrder,
    });

    return res.status(201).json({ quickReply });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const quickReply = await updateQuickReply({
      quickReplyId: req.params.quickReplyId,
      vendorId: req.user.id,
      changes: req.body,
    });

    return res.status(200).json({ quickReply });
  } catch (error) {
    return next(error);
  }
}

async function archive(req, res, next) {
  try {
    await archiveQuickReply({
      quickReplyId: req.params.quickReplyId,
      vendorId: req.user.id,
    });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

async function send(req, res, next) {
  try {
    const message = await sendQuickReply({
      quickReplyId: req.params.quickReplyId,
      conversationId: req.body.conversationId,
      vendorId: req.user.id,
      clientMessageId: req.body.clientMessageId,
    });

    return res.status(201).json({ message });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  create,
  update,
  archive,
  send,
};
