// backend/src/controllers/upload.controller.js
//
// Image uploads. Uses Cloudinary in production (CDN + automatic optimisation,
// which matters a lot on Zimbabwean mobile data), and falls back to local disk
// when Cloudinary env vars aren't set so local dev needs no credentials.
//
// The response shape is identical either way: { url }. Consumers don't care
// which backend served it.
//
// To enable Cloudinary, set in backend/.env:
//   CLOUDINARY_CLOUD_NAME=...
//   CLOUDINARY_API_KEY=...
//   CLOUDINARY_API_SECRET=...
const path = require('path');
const fs   = require('fs');
const { logger } = require('../utils/logger');

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const API_KEY    = process.env.CLOUDINARY_API_KEY || '';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
const USE_CLOUDINARY = !!(CLOUD_NAME && API_KEY && API_SECRET);

// Local fallback dir (dev only — ephemeral on most hosts, hence Cloudinary).
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

let cloudinary = null;
if (USE_CLOUDINARY) {
  cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key:    API_KEY,
    api_secret: API_SECRET,
    secure:     true,
  });
  logger.info('🖼️  Cloudinary image hosting enabled');
} else {
  logger.info('🖼️  Cloudinary not configured — using local disk uploads (dev only)');
}

// POST /api/uploads — single image (multer put it in memory or on disk).
async function uploadImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image provided' });

    // ── Local disk (dev) ───────────────────────────────────────────────────
    if (!USE_CLOUDINARY) {
      // multer.diskStorage already wrote the file.
      return res.status(201).json({ url: `/uploads/${req.file.filename}` });
    }

    // ── Cloudinary (production) ────────────────────────────────────────────
    // multer.memoryStorage gives us a buffer; stream it up.
    const folder = req.body?.folder || 'mzaya';

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          // Optimise on upload: cap dimensions, auto quality + format.
          // Delivery URLs can still request smaller variants on the fly.
          transformation: [
            { width: 1600, height: 1600, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (err, uploaded) => (err ? reject(err) : resolve(uploaded)),
      );
      stream.end(req.file.buffer);
    });

    return res.status(201).json({ url: result.secure_url });
  } catch (err) {
    logger.error('uploadimage_error', { error: err.message });
    return res.status(500).json({ error: 'Failed to upload image' });
  }
}

module.exports = { uploadImage, UPLOAD_DIR, USE_CLOUDINARY };
