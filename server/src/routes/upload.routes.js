import { Router } from "express";
import { Readable } from "stream";
import upload from "../middleware/upload.middleware.js";
import { protect } from "../middleware/auth.middleware.js";
import cloudinary from "../config/cloudinary.js";
import ApiError from "../utils/ApiError.js";

const router = Router();

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "nesthaven",
        transformation: [
          {
            width: 1200,
            height: 800,
            crop: "limit",
            quality: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    Readable.from(buffer).pipe(stream);
  });
};

router.post(
  "/",
  protect,
  upload.array("images", 5),
  async (req, res) => {
    if (!req.files || req.files.length === 0) {
      throw new ApiError("No files uploaded", 400);
    }

    const uploadedImages = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer))
    );

    const images = uploadedImages.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
    }));

    res.json({
      success: true,
      images,
    });
  }
);

router.delete("/:publicId", protect, async (req, res) => {
  await cloudinary.uploader.destroy(`nesthaven/${req.params.publicId}`);

  res.json({
    success: true,
    message: "Image deleted",
  });
});

export default router;
