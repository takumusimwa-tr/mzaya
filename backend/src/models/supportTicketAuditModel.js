const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SupportTicketAudit = sequelize.define('SupportTicketAudit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  ticket_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  actor_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  action: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  previous_value: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  new_value: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
}, {
  tableName: 'support_ticket_audit',
  underscored: true,
  timestamps: false,
  createdAt: 'created_at',
});

module.exports = SupportTicketAudit;
