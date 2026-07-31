const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ConversationParticipant = sequelize.define(
  'ConversationParticipant',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversation_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    left_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    muted_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_read_message_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    last_read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'conversation_participants',
    underscored: true,
    timestamps: true,
  }
);

module.exports = ConversationParticipant;
