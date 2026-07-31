const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UploadSession = sequelize.define('UploadSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: { type: DataTypes.UUID, allowNull: false },
  conversation_id: { type: DataTypes.UUID, allowNull: false },
  storage_key: { type: DataTypes.TEXT, allowNull: false, unique: true },
  original_name: { type: DataTypes.STRING(255), allowNull: false },
  normalized_name: { type: DataTypes.STRING(255), allowNull: false },
  mime_type: { type: DataTypes.STRING(120), allowNull: false },
  declared_size: { type: DataTypes.BIGINT, allowNull: false },
  uploaded_size: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
}, {
  tableName: 'upload_sessions',
  underscored: true,
  timestamps: true,
});

module.exports = UploadSession;
