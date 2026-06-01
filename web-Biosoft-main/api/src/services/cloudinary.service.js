const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

let cloudinaryConfigured = true;
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn(
    'Cloudinary configuration missing. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to your .env file to enable uploads.'
  );
  cloudinaryConfigured = false;
} else {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key:    CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

// Storage para productos
let uploadProduct;
if (cloudinaryConfigured) {
  const productStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder:         'bionatural/products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
    },
  });

  uploadProduct = multer({
    storage: productStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  });
} else {
  // Fallback multer config so server doesn't crash — uploads endpoints should still
  // return a clear error if Cloudinary isn't configured.
  uploadProduct = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
  });
}

module.exports = { cloudinary, uploadProduct, cloudinaryConfigured };
