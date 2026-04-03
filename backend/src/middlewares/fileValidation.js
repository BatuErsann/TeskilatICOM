const fs = require('fs');
const path = require('path');

/**
 * Magic byte signatures for allowed image types.
 * These are the actual binary headers of real image files — impossible to fake
 * by simply renaming a .php or .exe to .jpg.
 */
const MAGIC_BYTES = {
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF] // JPEG/JFIF
  ],
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] // PNG
  ],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]  // GIF89a
  ],
  'image/webp': [
    // RIFF....WEBP (bytes 0-3 = RIFF, bytes 8-11 = WEBP)
    null // Special handling below
  ],
  'image/svg+xml': [
    null // Special handling — text-based, check for XML/SVG markers
  ]
};

/**
 * Checks if a buffer starts with the given byte sequence.
 */
function bufferStartsWith(buffer, signature) {
  if (buffer.length < signature.length) return false;
  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) return false;
  }
  return true;
}

/**
 * Validates file content against its claimed MIME type using magic bytes.
 * Returns { valid: boolean, detectedType: string|null }
 */
function validateMagicBytes(filePath, claimedMimeType) {
  try {
    const buffer = fs.readFileSync(filePath);

    if (buffer.length === 0) {
      return { valid: false, detectedType: null, reason: 'Empty file' };
    }

    // SVG validation — text-based format
    if (claimedMimeType === 'image/svg+xml') {
      const text = buffer.toString('utf-8', 0, Math.min(buffer.length, 4096)).trim();
      // Must contain <svg and valid XML-like structure
      // Block anything that looks like a script (PHP, JS, etc.)
      const hasSvgTag = /<svg[\s>]/i.test(text);
      const hasXmlDecl = /^<\?xml/i.test(text) || hasSvgTag;
      const hasDangerousContent = /<script[\s>]/i.test(text) ||
        /<\?php/i.test(text) ||
        /javascript:/i.test(text) ||
        /on\w+\s*=/i.test(text) || // onclick, onerror, etc.
        /<iframe/i.test(text) ||
        /<embed/i.test(text) ||
        /<object/i.test(text);

      if (hasDangerousContent) {
        return { valid: false, detectedType: 'svg+malicious', reason: 'SVG contains potentially dangerous content (scripts, event handlers, iframes)' };
      }

      if (hasXmlDecl && hasSvgTag) {
        return { valid: true, detectedType: 'image/svg+xml' };
      }
      return { valid: false, detectedType: null, reason: 'File does not appear to be a valid SVG' };
    }

    // WebP validation — RIFF container
    if (claimedMimeType === 'image/webp') {
      const isRiff = bufferStartsWith(buffer, [0x52, 0x49, 0x46, 0x46]); // "RIFF"
      const isWebp = buffer.length >= 12 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 &&
        buffer[10] === 0x42 && buffer[11] === 0x50; // "WEBP"
      if (isRiff && isWebp) {
        return { valid: true, detectedType: 'image/webp' };
      }
      return { valid: false, detectedType: null, reason: 'File does not have valid WebP magic bytes' };
    }

    // Standard magic byte check for JPEG, PNG, GIF
    const signatures = MAGIC_BYTES[claimedMimeType];
    if (signatures) {
      for (const sig of signatures) {
        if (sig && bufferStartsWith(buffer, sig)) {
          return { valid: true, detectedType: claimedMimeType };
        }
      }
    }

    // Also check if the file is actually a different valid image type
    // (in case someone sends a PNG with .jpg extension — still an image, so allow it)
    for (const [mime, sigs] of Object.entries(MAGIC_BYTES)) {
      if (mime === 'image/svg+xml' || mime === 'image/webp') continue;
      if (!sigs) continue;
      for (const sig of sigs) {
        if (sig && bufferStartsWith(buffer, sig)) {
          return { valid: true, detectedType: mime };
        }
      }
    }

    return { valid: false, detectedType: null, reason: 'File magic bytes do not match any allowed image type' };
  } catch (err) {
    return { valid: false, detectedType: null, reason: `Error reading file: ${err.message}` };
  }
}

/**
 * Express middleware that validates uploaded files after multer has saved them.
 * If validation fails, the file is deleted and a 400 error is returned.
 */
function validateUploadedFile(req, res, next) {
  const file = req.file;
  if (!file) return next();

  const result = validateMagicBytes(file.path, file.mimetype);
  if (!result.valid) {
    // Delete the invalid file immediately
    try { fs.unlinkSync(file.path); } catch (e) { /* ignore */ }
    return res.status(400).json({
      message: `Geçersiz dosya tipi: ${result.reason}. Sadece gerçek resim dosyaları kabul edilir.`
    });
  }

  next();
}

/**
 * Same as above but for multiple files (upload.array).
 */
function validateUploadedFiles(req, res, next) {
  const files = req.files;
  if (!files || files.length === 0) return next();

  for (const file of files) {
    const result = validateMagicBytes(file.path, file.mimetype);
    if (!result.valid) {
      // Delete ALL uploaded files in this batch
      for (const f of files) {
        try { fs.unlinkSync(f.path); } catch (e) { /* ignore */ }
      }
      return res.status(400).json({
        message: `Geçersiz dosya tipi (${file.originalname}): ${result.reason}. Sadece gerçek resim dosyaları kabul edilir.`
      });
    }
  }

  next();
}

/**
 * Sanitize filename to prevent path traversal.
 * Strips directory components and null bytes.
 */
function sanitizeFilename(filename) {
  // Remove any directory traversal attempts
  return path.basename(filename)
    .replace(/\0/g, '')        // null bytes
    .replace(/\.\./g, '')      // double dots
    .replace(/[\/\\]/g, '');   // slashes
}

module.exports = {
  validateMagicBytes,
  validateUploadedFile,
  validateUploadedFiles,
  sanitizeFilename
};
