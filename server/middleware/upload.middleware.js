import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only JPEG, PNG, WEBP, GIF files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});