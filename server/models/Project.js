import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, maxlength: 2000 },
    requiredSkills: [{ type: String, trim: true }],
    techStack: [{ type: String, trim: true }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["open", "in-progress", "closed"],
      default: "open",
    },
    tags: [{ type: String, trim: true }],
    maxMembers: { type: Number, default: 5, min: 1, max: 20 },
    duration: { type: String, default: "" },
    lookingFor: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true }
);

projectSchema.index({ requiredSkills: 1, status: 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ createdAt: -1 });

export default mongoose.model("Project", projectSchema);