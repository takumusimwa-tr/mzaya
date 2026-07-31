const {
  createSupportTicket,
  listSupportQueue,
  getSupportTicket,
  assignSupportTicket,
  updateSupportTicket,
  createInternalNote,
} = require('../services/supportTicket.service');

async function create(req, res, next) {
  try {
    const ticket = await createSupportTicket({
      customerId: req.user.id,
      subject: req.body.subject,
      category: req.body.category,
      priority: req.body.priority,
      orderId: req.body.orderId,
      body: req.body.body,
      metadata: req.body.metadata,
    });

    return res.status(201).json({ ticket });
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const result = await listSupportQueue({
      status: req.query.status,
      priority: req.query.priority,
      assignedAgentId: req.query.assignedAgentId,
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
    const ticket = await getSupportTicket({
      ticketId: req.params.ticketId,
      userId: req.user.id,
      isSupportAgent: ['support', 'admin'].includes(req.user.role),
    });

    return res.status(200).json({ ticket });
  } catch (error) {
    return next(error);
  }
}

async function assign(req, res, next) {
  try {
    const ticket = await assignSupportTicket({
      ticketId: req.params.ticketId,
      agentId: req.body.agentId,
      actorId: req.user.id,
    });

    return res.status(200).json({ ticket });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const ticket = await updateSupportTicket({
      ticketId: req.params.ticketId,
      actorId: req.user.id,
      changes: {
        status: req.body.status,
        priority: req.body.priority,
        category: req.body.category,
        resolution_summary: req.body.resolutionSummary,
      },
    });

    return res.status(200).json({ ticket });
  } catch (error) {
    return next(error);
  }
}

async function createNote(req, res, next) {
  try {
    const note = await createInternalNote({
      ticketId: req.params.ticketId,
      authorId: req.user.id,
      body: req.body.body,
      metadata: req.body.metadata,
    });

    return res.status(201).json({ note });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  create,
  list,
  getOne,
  assign,
  update,
  createNote,
};
