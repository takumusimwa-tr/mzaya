const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SupportTicket = sequelize.define('SupportTicket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  conversation_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  assigned_agent_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  priority: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'normal',
  },
  status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'open',
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'general',
  },
  subject: {
    type: DataTypes.STRING(180),
    allowNull: false,
  },
  resolution_summary: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  first_response_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  closed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
}, {
  tableName: 'support_tickets',
  underscored: true,
  timestamps: true,
});

module.exports = SupportTicket;
