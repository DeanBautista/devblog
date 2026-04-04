const { v2: cloudinary } = require('cloudinary');

const CLOUDINARY_COVER_FOLDER_ROOT = 'devblog/post-covers';

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function ensureCloudinaryConfigured() {
  if (!isCloudinaryConfigured()) {
    const error = new Error('Cloudinary is not configured on the server');
    error.statusCode = 500;
    throw error;
  }
}

function getUserCoverFolder(userId) {
  return `${CLOUDINARY_COVER_FOLDER_ROOT}/${String(userId).trim()}`;
}

function extractCloudinaryPublicIdFromUrl(imageUrl) {
  if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
    return null;
  }

  try {
    const parsedUrl = new URL(imageUrl);

    if (!parsedUrl.hostname.includes('res.cloudinary.com')) {
      return null;
    }

    const uploadMarker = '/upload/';
    const uploadMarkerIndex = parsedUrl.pathname.indexOf(uploadMarker);

    if (uploadMarkerIndex < 0) {
      return null;
    }

    const pathAfterUpload = parsedUrl.pathname.slice(uploadMarkerIndex + uploadMarker.length);
    const pathSegments = pathAfterUpload.split('/').filter(Boolean);

    if (pathSegments.length < 1) {
      return null;
    }

    const versionSegmentIndex = pathSegments.findIndex((segment) => /^v\d+$/.test(segment));
    const publicIdSegments =
      versionSegmentIndex >= 0 ? pathSegments.slice(versionSegmentIndex + 1) : pathSegments;

    if (publicIdSegments.length < 1) {
      return null;
    }

    const publicIdWithExtension = publicIdSegments.join('/');
    const extensionPattern = /\.[^.\/]+$/;
    const publicId = decodeURIComponent(publicIdWithExtension.replace(extensionPattern, ''));

    return publicId || null;
  } catch {
    return null;
  }
}

function isUserOwnedCoverPublicId(publicId, userId) {
  if (typeof publicId !== 'string' || !publicId.trim()) {
    return false;
  }

  const userFolderPrefix = `${getUserCoverFolder(userId)}/`;
  return publicId.startsWith(userFolderPrefix);
}

function uploadCoverImageBuffer({ userId, buffer }) {
  ensureCloudinaryConfigured();

  const cfg = cloudinary.config();
  console.log({
    cloud_name: cfg.cloud_name,
    api_key: cfg.api_key,
    secret_length: cfg.api_secret?.length,
    secret_preview: cfg.api_secret?.slice(0, 4) + '...',
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: getUserCoverFolder(userId),
        resource_type: 'image',
        overwrite: false,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.on('error', reject);
    uploadStream.end(buffer);
  });
}

async function deleteUserOwnedCoverByUrl({ imageUrl, userId }) {
  if (!imageUrl) {
    return {
      deleted: false,
      reason: 'empty-url',
      publicId: null,
      result: 'skipped',
    };
  }

  if (!isCloudinaryConfigured()) {
    return {
      deleted: false,
      reason: 'cloudinary-not-configured',
      publicId: null,
      result: 'skipped',
    };
  }

  const publicId = extractCloudinaryPublicIdFromUrl(imageUrl);

  if (!publicId) {
    return {
      deleted: false,
      reason: 'invalid-url',
      publicId: null,
      result: 'skipped',
    };
  }

  if (!isUserOwnedCoverPublicId(publicId, userId)) {
    return {
      deleted: false,
      reason: 'not-owned-by-user',
      publicId,
      result: 'skipped',
    };
  }

  const destroyResponse = await cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    invalidate: true,
  });

  const destroyResult = destroyResponse?.result ?? destroyResponse;
  const deleted = destroyResult === 'ok' || destroyResult === 'not found';

  return {
    deleted,
    reason: deleted ? null : 'destroy-failed',
    publicId,
    result: destroyResult,
  };
}

module.exports = {
  CLOUDINARY_COVER_FOLDER_ROOT,
  isCloudinaryConfigured,
  uploadCoverImageBuffer,
  extractCloudinaryPublicIdFromUrl,
  deleteUserOwnedCoverByUrl,
};
