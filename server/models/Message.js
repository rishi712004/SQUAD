import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    room: { type: String, required: true, index: true },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true, maxlength: 5000 },
    type: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ room: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);