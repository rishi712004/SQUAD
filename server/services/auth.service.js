import User from "../models/User.js";
import { signAccess, signRefresh, verifyRefresh } from "../utils/tokens.js";
import { ApiError } from "../utils/ApiError.js";

export const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "Email already in use");

  const user = await User.create({ name, email, password });

  const access = signAccess({ id: user._id, role: user.role });
  const refresh = signRefresh({ id: user._id });

  user.refreshTokens.push(refresh);
  await user.save({ validateBeforeSave: false });

  return {
    access,
    refresh,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password +refreshTokens");
  if (!user || !(await user.comparePassword(password)))
    throw new ApiError(401, "Invalid credentials");

  const access = signAccess({ id: user._id, role: user.role });
  const refresh = signRefresh({ id: user._id });

  user.refreshTokens.push(refresh);
  await user.save({ validateBeforeSave: false });

  return {
    access,
    refresh,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

export const rotateRefreshToken = async (token) => {
  let payload;
  try {
    payload = verifyRefresh(token);
  } catch {
    throw new ApiError(403, "Invalid or expired refresh token");
  }

  const user = await User.findById(payload.id).select("+refreshTokens");
  if (!user || !user.refreshTokens.includes(token))
    throw new ApiError(403, "Refresh token reuse detected");

  // rotate — remove old, issue new
  user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
  const newAccess = signAccess({ id: user._id, role: user.role });
  const newRefresh = signRefresh({ id: user._id });
  user.refreshTokens.push(newRefresh);
  await user.save({ validateBeforeSave: false });

  return { access: newAccess, refresh: newRefresh };
};

export const logoutUser = async (token) => {
  try {
    const payload = verifyRefresh(token);
    await User.findByIdAndUpdate(payload.id, { $pull: { refreshTokens: token } });
  } catch {
    // token already invalid — still treat as logged out
  }
};

export const handleOAuthUser = async ({ name, email, avatar, provider, providerId }) => {
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({ name, email, avatar, provider, providerId, isVerified: true });
  }

  const access = signAccess({ id: user._id, role: user.role });
  const refresh = signRefresh({ id: user._id });
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push(refresh);
  await user.save({ validateBeforeSave: false });

  return { access, refresh };
};