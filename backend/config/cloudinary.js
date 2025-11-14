import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a local file to Cloudinary and removes the local file.
 * @param {string} filePath - local path to the file
 * @returns {Promise<string>} - secure_url
 */
const uploadOnCloudinary = async (filePath) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
    });
    // remove local file if exists
    try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    return uploadResult.secure_url;
  } catch (error) {
    // Attempt to remove file if upload fails
    try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    // Rethrow so caller can handle HTTP response
    throw new Error(`Cloudinary upload error: ${error.message || error}`);
  }
};

export default uploadOnCloudinary;
