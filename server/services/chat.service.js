import Message from "../models/Message.js";
import { ApiError } from "../utils/ApiError.js";

export const saveMessage = async ({ room, senderId, content, type = "text" }) => {
  const message = await Message.create({
    room,
    sender: senderId,
    content,
    type,
    deliveredTo: [senderId],
    readBy: [senderId],
  });
  return message.populate("sender", "name avatar");
};

export const getRoomMessages = async (room, page = 1, limit = 30) => {
  const messages = await Message.find({ room, isDeleted: false })
    .populate("sender", "name avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return messages.reverse(); // return chronological order
};

export const markMessagesRead = async (room, userId) => {
  await Message.updateMany(
    { room, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } }
  );
};

export const deleteMessage = async (messageId, userId) => {
  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, "Message not found");
  if (message.sender.toString() !== userId)
    throw new ApiError(403, "Can only delete your own messages");

  message.isDeleted = true;
  message.content = "This message was deleted";
  await message.save();
  return message;
};

export const getUserRooms = async (userId) => {
  // returns distinct rooms where the user has sent at least one message
  const rooms = await Message.distinct("room", { sender: userId });
  return rooms;
};