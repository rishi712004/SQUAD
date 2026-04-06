import User from "../models/User.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";

const ALLOWED_UPDATE_FIELDS = [
  "name", "bio", "skills", "techStack", "github", "linkedin",
];

export const getUserById = async (id) => {
  const user = await User.findById(id)
    .select("-refreshTokens")
    .populate("followers", "name avatar")
    .populate("following", "name avatar");
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

export const updateUserProfile = async (userId, updates) => {
  const sanitized = Object.fromEntries(
    Object.entries(updates).filter(([k]) => ALLOWED_UPDATE_FIELDS.includes(k))
  );
  const user = await User.findByIdAndUpdate(userId, sanitized, {
    new: true,
    runValidators: true,
  }).select("-refreshTokens");
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

export const updateAvatar = async (userId, fileBuffer) => {
  if (!fileBuffer) throw new ApiError(400, "No file buffer provided");
  const result = await uploadToCloudinary(fileBuffer);
  const user = await User.findByIdAndUpdate(
    userId,
    { avatar: result.secure_url },
    { new: true }
  ).select("avatar");
  return { avatar: user.avatar };
};

export const searchUsers = async ({ skills, q, page = 1, limit = 20 }) => {
  const filter = {};
  if (skills) filter.skills = { $in: skills.split(",").map((s) => s.trim()) };
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { bio: { $regex: q, $options: "i" } },
    ];
  }

  const users = await User.find(filter)
    .select("name avatar bio skills")
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await User.countDocuments(filter);
  return { users, total, pages: Math.ceil(total / limit) };
};