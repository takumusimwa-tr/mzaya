const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MessageNotificationState = sequelize.define(
  'MessageNotificationState',
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
    unread_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    last_notified_message_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    last_notified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    muted_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'message_notification_state',
    underscored: true,
    timestamps: true,
  }
);

module.exports = MessageNotificationState;
