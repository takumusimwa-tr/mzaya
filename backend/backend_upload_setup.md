# Backend setup for image uploads

## 1. Install multer (in backend/)
```powershell
cd C:\Users\takum\Downloads\Projects\mzaya\backend
npm install multer
```

## 2. Place the new files
- `backend/src/controllers/upload.controller.js`  (new)
- `backend/src/routes/upload.routes.js`            (new)

## 3. Edit backend/src/index.js — add TWO things

### a) Serve the uploads folder statically
Near the top where other middleware is set up (after `app.use(express.json())`), add:
```javascript
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
```

### b) Mount the upload route
Where the other routes are mounted (alongside `app.use('/api/orders', ...)` etc), add:
```javascript
const uploadRoutes = require('./routes/upload.routes');
app.use('/api/uploads', uploadRoutes);
```

## 4. Restart the backend
```powershell
npm run dev
```

That's it. Images upload to `backend/uploads/` and are served at
`http://localhost:5000/uploads/<filename>`.

## At deployment
Swap the local disk storage for Cloudinary or S3 — only `upload.controller.js`
and `upload.routes.js` change; the frontend stays identical.
