const driver = process.env.MEDIA_STORAGE_DRIVER || 'local';

module.exports = driver === 's3'
  ? require('./s3Uploader')
  : require('./localUploader');
