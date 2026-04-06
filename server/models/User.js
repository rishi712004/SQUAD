import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false },
    avatar: { type: String, default: "" },
    provider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
    providerId: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    skills: [{ type: String, trim: true }],
    techStack: [{ type: String, trim: true }],
    bio: { type: String, default: "", maxlength: 500 },
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    refreshTokens: { type: [String], select: false, default: [] },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.index({ skills: 1 });
userSchema.index({ email: 1 });

export default mongoose.model("User", userSchema);