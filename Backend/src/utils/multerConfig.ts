import type { Request } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import * as cloudinary from "cloudinary";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { _config } from "@config/_config";

// Load Environment Variables
dotenv.config();

// Cloudinary Config
cloudinary.v2.config({
  cloud_name: _config.CLOUDINARY_CLOUD_NAME,
  api_key: _config.CLOUDINARY_API_KEY,
  api_secret: _config.CLOUDINARY_API_SECRET,
});

// Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: async (req: Request, file) => {
    return {
      folder: "uploads",
      format: file.mimetype.split("/")[1], // Auto-detect format (jpg, png, mp4)
      resource_type: file.mimetype.startsWith("image/") ? "image" : "video",
    };
  },
});

// Multer Upload Middleware
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("video/")) {
      return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only images and videos are allowed!"));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size: 5MB
});

// Function to delete file locally (if an error occurs)
const deleteLocalFile = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting local file:", err);
    });
  }
};

export const deleteMediaCloudinary = async (Url: string): Promise<void> => {
  try {
    console.log("Full URL:", Url);

    // Public ID extract karein (without extension)
    const urlParts = Url.split("/");
    const fileNameWithExt = urlParts.pop(); // last part (filename.jpg)
    const folderName = urlParts.pop(); // 'uploads' ya koi bhi folder ho sakta hai
    if (!fileNameWithExt || !folderName) {
      throw new Error("Invalid media URL format");
    }

    // File name without extension
    const publicId = `${folderName}/${fileNameWithExt.split(".")[0]}`;

    console.log("Extracted Public ID:", publicId);

    // Cloudinary API se delete request
    const result = await cloudinary.v2.uploader.destroy(publicId);
    
    if (result.result !== "ok") {
      throw new Error(`Error deleting media from Cloudinary: ${result.message || "Unknown error"}`);
    }

    console.log("Media deleted successfully from Cloudinary");
  } catch (error) {
    console.error("Error deleting media from Cloudinary:", error);
  }
};



// Export Modules
export { upload, cloudinary, deleteLocalFile };
