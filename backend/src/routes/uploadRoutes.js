const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyAdmin } = require('../middlewares/authMiddleware');
const { validateUploadedFile, validateUploadedFiles, sanitizeFilename } = require('../middlewares/fileValidation');

const router = express.Router();

// Uploads klasörünü oluştur
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer yapılandırması
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Benzersiz dosya adı oluştur
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize extension — only allow known safe extensions
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const safeExt = allowedExtensions.includes(ext) ? ext : '.bin';
    cb(null, uniqueSuffix + safeExt);
  }
});

// Dosya filtresi - sadece resim dosyaları (first layer: MIME check)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir (jpeg, jpg, png, gif, webp, svg)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Tek dosya yükleme — Admin only + magic byte validation
router.post('/image', verifyAdmin, upload.single('image'), validateUploadedFile, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Dosya yüklenemedi' });
    }

    // Relative path döndür
    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Dosya başarıyla yüklendi',
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Dosya yüklenirken bir hata oluştu' });
  }
});

// Birden fazla dosya yükleme — Admin only + magic byte validation
router.post('/images', verifyAdmin, upload.array('images', 10), validateUploadedFiles, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Dosya yüklenemedi' });
    }

    const urls = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename
    }));

    res.json({
      success: true,
      message: 'Dosyalar başarıyla yüklendi',
      files: urls
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Dosyalar yüklenirken bir hata oluştu' });
  }
});

// Dosya silme — Admin only + path traversal prevention
router.delete('/:filename', verifyAdmin, (req, res) => {
  try {
    // Sanitize filename to prevent path traversal (e.g. ../../etc/passwd)
    const safeFilename = sanitizeFilename(req.params.filename);

    if (!safeFilename || safeFilename !== req.params.filename) {
      return res.status(400).json({ message: 'Geçersiz dosya adı' });
    }

    const filePath = path.join(uploadDir, safeFilename);

    // Double-check the resolved path is still within uploadDir
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadDir = path.resolve(uploadDir);
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return res.status(400).json({ message: 'Geçersiz dosya yolu' });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Dosya silindi' });
    } else {
      res.status(404).json({ message: 'Dosya bulunamadı' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Dosya silinirken bir hata oluştu' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Dosya boyutu çok büyük. Maksimum 10MB' });
    }
    return res.status(400).json({ message: error.message });
  }
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
});

module.exports = router;
