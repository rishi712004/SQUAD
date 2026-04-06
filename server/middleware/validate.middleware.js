import { ApiError } from "../utils/ApiError.js";

// Generic field presence validator
export const validateBody = (requiredFields) => (req, res, next) => {
  const missing = requiredFields.filter(
    (field) => req.body[field] === undefined || req.body[field] === ""
  );
  if (missing.length > 0)
    return next(new ApiError(400, `Missing required fields: ${missing.join(", ")}`));
  next();
};

// Email format check
export const validateEmail = (req, res, next) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email))
    return next(new ApiError(400, "Invalid email format"));
  next();
};

// Password strength check
export const validatePassword = (req, res, next) => {
  const { password } = req.body;
  if (password && password.length < 6)
    return next(new ApiError(400, "Password must be at least 6 characters"));
  next();
};