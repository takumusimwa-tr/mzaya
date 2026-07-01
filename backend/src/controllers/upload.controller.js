const path = require('path');
const fs   = require('fs');

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// POST /api/uploads — handles a single image upload via multer
async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }
    // multer has already saved the file; return its public URL
    const url = `/uploads/${req.file.filename}`;
    return res.status(201).json({ url });
  } catch (err) {
    console.error('uploadImage error:', err.message);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
}

module.exports = { uploadImage, UPLOAD_DIR };
