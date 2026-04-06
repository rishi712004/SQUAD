import { verifyAccess } from "../utils/tokens.js";
import { ApiError } from "../utils/ApiError.js";

export const protect = (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer "))
      throw new ApiError(401, "No token provided");

    const token = auth.split(" ")[1];
    req.user = verifyAccess(token);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return next(new ApiError(401, "Token expired"));
    if (err.name === "JsonWebTokenError")
      return next(new ApiError(401, "Invalid token"));
    next(err);
  }
};