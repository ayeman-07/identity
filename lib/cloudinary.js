import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} originalName - Original filename
 * @param {string} folder - Cloudinary folder (e.g., 'dental-cases')
 * @param {string} resourceType - 'image', 'video', 'raw', or 'auto'
 * @returns {Promise<Object>} Upload result
 */
export const uploadToCloudinary = async (fileBuffer, originalName, folder = 'dental-cases', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: resourceType,
      folder: folder,
      public_id: `${Date.now()}-${originalName.replace(/\.[^/.]+$/, "")}`, // Remove extension, Cloudinary will add it
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    };

    // For STL files, use 'raw' resource type
    if (originalName.toLowerCase().endsWith('.stl')) {
      uploadOptions.resource_type = 'raw';
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - 'image', 'video', 'raw', or 'auto'
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'auto') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

/**
 * Generate signed URL for secure file access
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - 'image', 'video', 'raw', or 'auto'
 * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns {string} Signed URL
 */
export const generateSignedUrl = (publicId, resourceType = 'auto', expiresIn = 3600) => {
  const timestamp = Math.round(Date.now() / 1000) + expiresIn;
  
  return cloudinary.utils.private_download_url(publicId, 'pdf', {
    resource_type: resourceType,
    expires_at: timestamp,
  });
};

/**
 * Get file info from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - 'image', 'video', 'raw', or 'auto'
 * @returns {Promise<Object>} File info
 */
export const getFileInfo = async (publicId, resourceType = 'auto') => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Error getting file info from Cloudinary:', error);
    throw error;
  }
};

export default cloudinary;
