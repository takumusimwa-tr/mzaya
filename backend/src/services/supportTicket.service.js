const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const {
  SupportTicket,
  SupportInternalNote,
  SupportTicketAudit,
  ConversationParticipant,
  User,
} = require('../models/associations');
const {
  createConversation,
  sendMessage,
  assertParticipant,
} = require('./conversation.service');
const { recordSupportAudit } = require('./supportAudit.service');
const {
  supportEvents,
  SUPPORT_EVENT,
} = require('../events/support.events');

function serviceError(message, status = 400, code = 'SUPPORT_TICKET_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

async function assertAgent(ticketId, userId) {
  const ticket = await SupportTicket.findByPk(ticketId);
  if (!ticket) {
    throw serviceError('Support ticket not found', 404, 'SUPPORT_TICKET_NOT_FOUND');
  }

  if (ticket.assigned_agent_id && ticket.assigned_agent_id !== userId) {
    throw serviceError(
      'This ticket is assigned to another support agent',
      403,
      'SUPPORT_TICKET_NOT_ASSIGNED'
    );
  }

  return ticket;
}

async function createSupportTicket({
  customerId,
  subject,
  category = 'general',
  priority = 'normal',
  orderId = null,
  body,
  metadata = {},
}) {
  return sequelize.transaction(async (transaction) => {
    const conversation = await createConversation({
      createdBy: customerId,
      type: 'support',
      orderId,
      title: subject,
      metadata: {
        ...metadata,
        supportCategory: category,
        supportPriority: priority,
      },
      participants: [
        { userId: customerId, role: 'customer' },
      ],
    }).catch(async (error) => {
      if (error.code !== 'INSUFFICIENT_PARTICIPANTS') throw error;

      const conversationModel = require('../models/conversationModel');
      const participantModel = require('../models/conversationParticipantModel');

      const created = await conversationModel.create({
        type: 'support',
        order_id: orderId,
        created_by: customerId,
        title: subject,
        metadata: {
          ...metadata,
          supportCategory: category,
          supportPriority: priority,
        },
      }, { transaction });

      await participantModel.create({
        conversation_id: created.id,
        user_id: customerId,
        role: 'customer',
      }, { transaction });

      return created;
    });

    const ticket = await SupportTicket.create({
      conversation_id: conversation.id,
      customer_id: customerId,
      order_id: orderId,
      priority,
      category,
      subject,
      metadata,
    }, { transaction });

    if (body) {
      await sendMessage({
        conversationId: conversation.id,
        senderId: customerId,
        clientMessageId: `support-open:${ticket.id}`,
        type: 'text',
        body,
        metadata: {
          source: 'support_ticket_opening',
          ticketId: ticket.id,
        },
      });
    }

    await recordSupportAudit({
      ticketId: ticket.id,
      actorId: customerId,
      action: 'ticket_created',
      newValue: {
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
      },
      transaction,
    });

    transaction.afterCommit(() => {
      supportEvents.emit(SUPPORT_EVENT.TICKET_CREATED, {
        ticketId: ticket.id,
        conversationId: conversation.id,
        customerId,
        priority,
      });
    });

    return ticket;
  });
}

async function listSupportQueue({
  status,
  priority,
  assignedAgentId,
  cursor,
  limit = 30,
}) {
  const where = {};

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (assignedAgentId) where.assigned_agent_id = assignedAgentId;
  if (cursor) where.created_at = { [Op.lt]: new Date(cursor) };

  const tickets = await SupportTicket.findAll({
    where,
    include: [
      {
        model: User,
        as: 'customer',
        attributes: ['id', 'first_name', 'last_name'],
      },
      {
        model: User,
        as: 'assignedAgent',
        attributes: ['id', 'first_name', 'last_name'],
        required: false,
      },
    ],
    order: [
      [sequelize.literal(
        "CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END"
      ), 'ASC'],
      ['created_at', 'ASC'],
    ],
    limit: Math.min(Number(limit) || 30, 100),
  });

  const last = tickets[tickets.length - 1];

  return {
    tickets,
    nextCursor: last ? last.created_at.toISOString() : null,
  };
}

async function getSupportTicket({
  ticketId,
  userId,
  isSupportAgent = false,
}) {
  const ticket = await SupportTicket.findByPk(ticketId, {
    include: [
      {
        model: User,
        as: 'customer',
        attributes: ['id', 'first_name', 'last_name'],
      },
      {
        model: User,
        as: 'assignedAgent',
        attributes: ['id', 'first_name', 'last_name'],
        required: false,
      },
      {
        model: SupportInternalNote,
        as: 'internalNotes',
        required: false,
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'first_name', 'last_name'],
        }],
      },
      {
        model: SupportTicketAudit,
        as: 'audit',
        required: false,
      },
    ],
    order: [
      [{ model: SupportInternalNote, as: 'internalNotes' }, 'created_at', 'ASC'],
      [{ model: SupportTicketAudit, as: 'audit' }, 'created_at', 'ASC'],
    ],
  });

  if (!ticket) {
    throw serviceError('Support ticket not found', 404, 'SUPPORT_TICKET_NOT_FOUND');
  }

  if (!isSupportAgent) {
    await assertParticipant(ticket.conversation_id, userId);
  }

  return ticket;
}

async function assignSupportTicket({
  ticketId,
  agentId,
  actorId,
}) {
  return sequelize.transaction(async (transaction) => {
    const ticket = await SupportTicket.findByPk(ticketId, { transaction });

    if (!ticket) {
      throw serviceError('Support ticket not found', 404, 'SUPPORT_TICKET_NOT_FOUND');
    }

    const previousAgentId = ticket.assigned_agent_id;

    await ticket.update({
      assigned_agent_id: agentId,
      status: ticket.status === 'open' ? 'in_progress' : ticket.status,
      first_response_at: ticket.first_response_at || new Date(),
    }, { transaction });

    await ConversationParticipant.findOrCreate({
      where: {
        conversation_id: ticket.conversation_id,
        user_id: agentId,
      },
      defaults: {
        role: 'support',
        joined_at: new Date(),
      },
      transaction,
    });

    await recordSupportAudit({
      ticketId,
      actorId,
      action: 'ticket_assigned',
      previousValue: { assignedAgentId: previousAgentId },
      newValue: { assignedAgentId: agentId },
      transaction,
    });

    transaction.afterCommit(() => {
      supportEvents.emit(SUPPORT_EVENT.TICKET_ASSIGNED, {
        ticketId,
        conversationId: ticket.conversation_id,
        agentId,
        previousAgentId,
      });
    });

    return ticket;
  });
}

async function updateSupportTicket({
  ticketId,
  actorId,
  changes,
}) {
  return sequelize.transaction(async (transaction) => {
    const ticket = await SupportTicket.findByPk(ticketId, { transaction });

    if (!ticket) {
      throw serviceError('Support ticket not found', 404, 'SUPPORT_TICKET_NOT_FOUND');
    }

    const previous = {
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      resolutionSummary: ticket.resolution_summary,
    };

    const updates = { ...changes };

    if (changes.status === 'resolved') {
      updates.resolved_at = new Date();
    }

    if (changes.status === 'closed') {
      updates.closed_at = new Date();
    }

    await ticket.update(updates, { transaction });

    await recordSupportAudit({
      ticketId,
      actorId,
      action: changes.priority !== previous.priority
        ? 'ticket_escalated'
        : 'ticket_updated',
      previousValue: previous,
      newValue: changes,
      transaction,
    });

    transaction.afterCommit(() => {
      if (changes.priority !== previous.priority) {
        supportEvents.emit(SUPPORT_EVENT.TICKET_ESCALATED, {
          ticketId,
          conversationId: ticket.conversation_id,
          priority: ticket.priority,
        });
      }

      if (changes.status && changes.status !== previous.status) {
        supportEvents.emit(SUPPORT_EVENT.TICKET_STATUS_CHANGED, {
          ticketId,
          conversationId: ticket.conversation_id,
          status: ticket.status,
        });
      }
    });

    return ticket;
  });
}

async function createInternalNote({
  ticketId,
  authorId,
  body,
  metadata = {},
}) {
  return sequelize.transaction(async (transaction) => {
    await assertAgent(ticketId, authorId); // authorization guard — throws if not agent

    const note = await SupportInternalNote.create({
      ticket_id: ticketId,
      author_id: authorId,
      body,
      metadata,
    }, { transaction });

    await recordSupportAudit({
      ticketId,
      actorId: authorId,
      action: 'internal_note_created',
      newValue: { noteId: note.id },
      transaction,
    });

    transaction.afterCommit(() => {
      supportEvents.emit(SUPPORT_EVENT.NOTE_CREATED, {
        ticketId,
        noteId: note.id,
        authorId,
      });
    });

    return note;
  });
}

module.exports = {
  createSupportTicket,
  listSupportQueue,
  getSupportTicket,
  assignSupportTicket,
  updateSupportTicket,
  createInternalNote,
};
