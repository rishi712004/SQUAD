import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(", ") });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
};