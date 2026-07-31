const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ConversationModerationAction = sequelize.define(
  'ConversationModerationAction',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    conversation_id: { type: DataTypes.UUID, allowNull: false },
    target_user_id: { type: DataTypes.UUID, allowNull: true },
    actor_id: { type: DataTypes.UUID, allowNull: false },
    action: { type: DataTypes.STRING(50), allowNull: false },
    reason: { type: DataTypes.STRING(500), allowNull: true },
    expires_at: { type: DataTypes.DATE, allowNull: true },
    metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
  },
  {
    tableName: 'conversation_moderation_actions',
    underscored: true,
    timestamps: false,
    createdAt: 'created_at',
  }
);

module.exports = ConversationModerationAction;
