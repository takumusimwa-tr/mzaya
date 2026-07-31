const path = require('path');

const LIMITS = Object.freeze({
  image: 15 * 1024 * 1024,
  audio: 25 * 1024 * 1024,
  pdf: 20 * 1024 * 1024,
  file: 25 * 1024 * 1024,
});

const ALLOWED = Object.freeze({
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'application/pdf': 'pdf',
  'audio/webm': 'audio',
  'audio/ogg': 'audio',
  'audio/mpeg': 'audio',
  'audio/mp4': 'audio',
});

function serviceError(message, status = 400, code = 'MEDIA_VALIDATION_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function normalizeFilename(filename) {
  const extension = path.extname(filename || '').toLowerCase();
  const basename = path.basename(filename || 'file', extension)
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 180) || 'file';

  return `${basename}${extension}`.slice(0, 255);
}

function classifyMimeType(mimeType) {
  return ALLOWED[mimeType] || null;
}

function validateUploadDeclaration({ filename, mimeType, byteSize }) {
  const mediaKind = classifyMimeType(mimeType);

  if (!mediaKind) {
    throw serviceError(
      'Unsupported file type',
      415,
      'UNSUPPORTED_MEDIA_TYPE'
    );
  }

  const parsedSize = Number(byteSize);
  if (!Number.isFinite(parsedSize) || parsedSize <= 0) {
    throw serviceError('Invalid file size', 400, 'INVALID_FILE_SIZE');
  }

  const limit = LIMITS[mediaKind] || LIMITS.file;
  if (parsedSize > limit) {
    throw serviceError(
      `File exceeds the ${Math.round(limit / 1024 / 1024)} MB limit`,
      413,
      'FILE_TOO_LARGE'
    );
  }

  return {
    mediaKind,
    normalizedName: normalizeFilename(filename),
    byteSize: parsedSize,
  };
}

function verifyDetectedMime({ declaredMime, detectedMime }) {
  if (!detectedMime || declaredMime !== detectedMime) {
    throw serviceError(
      'Uploaded file content does not match the declared type',
      415,
      'MIME_MISMATCH'
    );
  }
}

module.exports = {
  LIMITS,
  normalizeFilename,
  classifyMimeType,
  validateUploadDeclaration,
  verifyDetectedMime,
};
