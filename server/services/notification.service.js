import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

export const toggleFollow = async (followerId, targetId) => {
  if (followerId === targetId)
    throw new ApiError(400, "Cannot follow yourself");

  const target = await User.findById(targetId);
  if (!target) throw new ApiError(404, "User not found");

  const isFollowing = target.followers
    .map((id) => id.toString())
    .includes(followerId);

  if (isFollowing) {
    await User.findByIdAndUpdate(targetId, { $pull: { followers: followerId } });
    await User.findByIdAndUpdate(followerId, { $pull: { following: targetId } });
    return { following: false };
  }

  await User.findByIdAndUpdate(targetId, { $addToSet: { followers: followerId } });
  await User.findByIdAndUpdate(followerId, { $addToSet: { following: targetId } });

  const notif = await Notification.create({
    recipient: targetId,
    sender: followerId,
    type: "follow",
    ref: followerId,
    refModel: "User",
    message: "started following you",
  });

  const populated = await notif.populate("sender", "name avatar");
  return { following: true, notif: populated };
};

export const getUserNotifications = async (userId, page = 1, limit = 30) => {
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ recipient: userId })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Notification.countDocuments({ recipient: userId, read: false }),
  ]);
  return { notifications, unreadCount };
};

export const markAllNotificationsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, read: false },
    { read: true }
  );
  return { updated: result.modifiedCount };
};

export const markOneNotificationRead = async (notifId, userId) => {
  const notif = await Notification.findById(notifId);
  if (!notif) throw new ApiError(404, "Notification not found");
  if (notif.recipient.toString() !== userId)
    throw new ApiError(403, "Not your notification");
  notif.read = true;
  await notif.save();
  return notif;
};