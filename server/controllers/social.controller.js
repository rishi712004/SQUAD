import * as notifService from "../services/notification.service.js";

export const toggleFollow = async (req, res, next) => {
  try {
    const result = await notifService.toggleFollow(
      req.user.id, req.params.targetId
    );
    // emit socket notification if followed (not unfollowed)
    if (result.following && result.notif) {
      req.io.to(`user:${req.params.targetId}`).emit("notification", result.notif);
    }
    res.json({ success: true, following: result.following });
  } catch (err) {
    next(err);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const result = await notifService.getUserNotifications(req.user.id, req.query.page);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const result = await notifService.markAllNotificationsRead(req.user.id);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const markOneRead = async (req, res, next) => {
  try {
    const notif = await notifService.markOneNotificationRead(
      req.params.id, req.user.id
    );
    res.json({ success: true, notif });
  } catch (err) {
    next(err);
  }
};