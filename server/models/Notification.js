import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "follow",
        "project_apply",
        "project_accepted",
        "project_rejected",
        "message",
        "mention",
      ],
      required: true,
    },
    ref: { type: mongoose.Schema.Types.ObjectId },
    refModel: {
      type: String,
      enum: ["Project", "Message", "User"],
    },
    message: { type: String, default: "" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

export default mongoose.model("Notification", notificationSchema);