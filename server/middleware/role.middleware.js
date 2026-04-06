import { ApiError } from "../utils/ApiError.js";

export const requireRole = (...roles) =>
  (req, res, next) => {
    if (!req.user) return next(new ApiError(401, "Not authenticated"));
    if (!roles.includes(req.user.role))
      return next(new ApiError(403, "Insufficient permissions"));
    next();
  };