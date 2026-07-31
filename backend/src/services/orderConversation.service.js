const { sequelize } = require('../config/db');
const {
  ConversationParticipant,
  Order,
} = require('../models/associations');
const {
  createConversation,
  sendMessage,
} = require('./conversation.service');
const {
  findOrderConversation,
} = require('./conversationResolver.service');
const {
  vendorConversationEvents,
  VENDOR_CONVERSATION_EVENT,
} = require('../events/vendorConversation.events');

function serviceError(message, status = 400, code = 'ORDER_CONVERSATION_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

async function resolveOrderActors(orderId, transaction) {
  const order = await Order.findByPk(orderId, { transaction });

  if (!order) {
    throw serviceError('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  const customerId = order.customer_id || order.user_id;
  const vendorId = order.vendor_id;
  const mzayaId = order.rider_id || order.mzaya_id || order.assigned_rider_id;

  if (!customerId || !vendorId) {
    throw serviceError(
      'Order is missing required customer or vendor ownership',
      409,
      'ORDER_ACTORS_INCOMPLETE'
    );
  }

  return {
    order,
    customerId,
    vendorId,
    mzayaId,
  };
}

async function ensureParticipant({
  conversationId,
  userId,
  role,
  transaction,
}) {
  if (!userId) return null;

  const [participant] = await ConversationParticipant.findOrCreate({
    where: {
      conversation_id: conversationId,
      user_id: userId,
    },
    defaults: {
      role,
      joined_at: new Date(),
      left_at: null,
    },
    transaction,
  });

  if (participant.left_at) {
    await participant.update({
      role,
      left_at: null,
      joined_at: new Date(),
    }, { transaction });
  }

  return participant;
}

async function ensureOrderConversation({
  orderId,
  requestedBy,
  includeMzaya = true,
}) {
  return sequelize.transaction(async (transaction) => {
    const { order, customerId, vendorId, mzayaId } =
      await resolveOrderActors(orderId, transaction);

    const allowed = [customerId, vendorId, mzayaId].filter(Boolean);
    if (!allowed.includes(requestedBy)) {
      throw serviceError(
        'You are not authorized to open this order conversation',
        403,
        'ORDER_CONVERSATION_FORBIDDEN'
      );
    }

    let conversation = await findOrderConversation({
      orderId,
      transaction,
    });

    if (!conversation) {
      conversation = await createConversation({
        createdBy: requestedBy,
        type: 'order',
        orderId,
        title: `Order ${order.reference || order.id}`,
        metadata: {
          orderStatus: order.status,
          vendorId,
          customerId,
          mzayaId: includeMzaya ? mzayaId : null,
        },
        participants: [
          { userId: customerId, role: 'customer' },
          { userId: vendorId, role: 'vendor' },
          ...(includeMzaya && mzayaId
            ? [{ userId: mzayaId, role: 'rider' }]
            : []),
        ],
      });
    } else {
      await ensureParticipant({
        conversationId: conversation.id,
        userId: customerId,
        role: 'customer',
        transaction,
      });
      await ensureParticipant({
        conversationId: conversation.id,
        userId: vendorId,
        role: 'vendor',
        transaction,
      });
      if (includeMzaya && mzayaId) {
        await ensureParticipant({
          conversationId: conversation.id,
          userId: mzayaId,
          role: 'rider',
          transaction,
        });
      }
    }

    transaction.afterCommit(() => {
      vendorConversationEvents.emit(
        VENDOR_CONVERSATION_EVENT.READY,
        {
          conversationId: conversation.id,
          orderId,
          participantIds: allowed,
        }
      );
    });

    return conversation;
  });
}

async function syncOrderStatusMessage({
  orderId,
  status,
  actorId,
  text,
}) {
  const conversation = await ensureOrderConversation({
    orderId,
    requestedBy: actorId,
  });

  const message = await sendMessage({
    conversationId: conversation.id,
    senderId: actorId,
    clientMessageId: `order-status:${orderId}:${status}:${Date.now()}`,
    type: 'system',
    body: text || `Order status changed to ${status}.`,
    metadata: {
      event: 'order_status_changed',
      orderId,
      status,
    },
  });

  vendorConversationEvents.emit(
    VENDOR_CONVERSATION_EVENT.ORDER_STATUS_CHANGED,
    {
      conversationId: conversation.id,
      orderId,
      status,
      messageId: message.id,
    }
  );

  return message;
}

module.exports = {
  ensureOrderConversation,
  syncOrderStatusMessage,
};
