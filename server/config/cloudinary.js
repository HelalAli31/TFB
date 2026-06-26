const { v2: cloudinary } = require("cloudinary");
const path = require("path");

const {
  CLOUDINARY_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

const isCloudinaryConfigured = Boolean(
  CLOUDINARY_URL ||
    (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET)
);

if (isCloudinaryConfigured) {
  if (CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
  } else {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
}

function assertCloudinaryConfigured() {
  if (!isCloudinaryConfigured) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }
}

function normalizePublicIdPart(value) {
  return String(value || "")
    .trim()
    .replace(/[\\/]/g, "-")
    .replace(/[?#]/g, "");
}

function buildPublicId(folder, name) {
  const cleanFolder = normalizePublicIdPart(folder);
  const cleanName = normalizePublicIdPart(path.parse(name).name);
  return `${cleanFolder}/${cleanName}`;
}

function uploadBuffer(file, folder, name) {
  assertCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    const publicId = buildPublicId(folder, name);
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        overwrite: true,
        invalidate: true,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
}

async function deleteImage(folder, name) {
  assertCloudinaryConfigured();
  return cloudinary.uploader.destroy(buildPublicId(folder, name), {
    invalidate: true,
    resource_type: "image",
  });
}

async function deleteImagesByPrefix(folder, prefix) {
  assertCloudinaryConfigured();
  return cloudinary.api.delete_resources_by_prefix(
    buildPublicId(folder, prefix),
    {
      resource_type: "image",
      invalidate: true,
    }
  );
}

async function renameImage(folder, oldName, newName) {
  assertCloudinaryConfigured();
  const oldPublicId = buildPublicId(folder, oldName);
  const newPublicId = buildPublicId(folder, newName);

  if (oldPublicId === newPublicId) {
    return null;
  }

  return cloudinary.uploader.rename(oldPublicId, newPublicId, {
    overwrite: true,
    invalidate: true,
    resource_type: "image",
  });
}

function getImageUrl(folder, fileName) {
  assertCloudinaryConfigured();
  return cloudinary.url(buildPublicId(folder, fileName), {
    secure: true,
    resource_type: "image",
  });
}

module.exports = {
  buildPublicId,
  deleteImage,
  deleteImagesByPrefix,
  getImageUrl,
  isCloudinaryConfigured,
  renameImage,
  uploadBuffer,
};
