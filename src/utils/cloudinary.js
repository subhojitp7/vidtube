import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.error("No file path provided");
      return null;
    }

    // Check if file exists
    if (!fs.existsSync(localFilePath)) {
      console.error("File does not exist at path:", localFilePath);
      return null;
    }

    console.log("Uploading file to Cloudinary:", localFilePath);

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "vidtube", // Optional: Organize uploads in a folder
    });

    console.log("File uploaded to Cloudinary:", result.secure_url);

    // Delete the local file after successful upload
    fs.unlinkSync(localFilePath);
    console.log("Local file deleted after upload");

    return result;
  } catch (error) {
    console.error("Error in uploadOnCloudinary:", error.message);
    // Attempt to delete the local file if it exists
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log("Local file deleted after error");
    }
    return null;
  }
};

const deleteOnCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      console.error("No public ID provided");
      return null;
    }

    console.log("Deleting file from Cloudinary:", publicId);

    const result = await cloudinary.uploader.destroy(publicId);

    console.log("File deleted from Cloudinary:", result);

    return result;
  } catch (error) {
    console.error("Error in deleteOnCloudinary:", error.message);
    return null;
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };
