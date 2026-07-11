const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadImage, UPLOAD_DIR, USE_CLOUDINARY } = require('../controllers/upload.controller');

// When Cloudinary is enabled we keep the file in memory and stream it up.
// Otherwise we write to local disk (dev fallback).
const storage = USE_CLOUDINARY
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, UPLOAD_DIR),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, unique);
      },
    });

// Images only, max 5MB.
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

router.post('/', authenticate, upload.single('image'), uploadImage);

module.exports = router;
