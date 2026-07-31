const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MessageAttachment = sequelize.define('MessageAttachment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  message_id: { type: DataTypes.UUID, allowNull: false },
  upload_session_id: { type: DataTypes.UUID, allowNull: true },
  storage_key: { type: DataTypes.TEXT, allowNull: false, unique: true },
  thumbnail_key: { type: DataTypes.TEXT, allowNull: true },
  original_name: { type: DataTypes.STRING(255), allowNull: false },
  mime_type: { type: DataTypes.STRING(120), allowNull: false },
  media_kind: { type: DataTypes.STRING(30), allowNull: false },
  byte_size: { type: DataTypes.BIGINT, allowNull: false },
  duration_ms: { type: DataTypes.INTEGER, allowNull: true },
  width: { type: DataTypes.INTEGER, allowNull: true },
  height: { type: DataTypes.INTEGER, allowNull: true },
  waveform: { type: DataTypes.JSONB, allowNull: true },
  scan_status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'processing' },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'message_attachments',
  underscored: true,
  timestamps: true,
});

module.exports = MessageAttachment;
