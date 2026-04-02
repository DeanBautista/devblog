const multer = require('multer');

const MAX_COVER_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const coverUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_COVER_IMAGE_SIZE_BYTES,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      callback(new Error('Only JPG, PNG, WEBP, GIF, or AVIF images are allowed.'));
      return;
    }

    callback(null, true);
  },
});

const singleCoverUpload = coverUpload.single('image');

function coverImageUploadMiddleware(req, res, next) {
  singleCoverUpload(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Cover image must be 5MB or smaller.',
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid image upload payload.',
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Invalid image upload payload.',
    });
  });
}

module.exports = {
  MAX_COVER_IMAGE_SIZE_BYTES,
  coverImageUploadMiddleware,
};
