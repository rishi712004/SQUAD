import { verifyAccess } from "../utils/tokens.js";

export const protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ message: "No token" });
  try {
    req.user = verifyAccess(auth.split(" ")[1]);
    next();
  } catch {
    res.status(401).json({ message: "Token expired or invalid" });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: "Forbidden" });
  next();
};