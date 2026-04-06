import * as userService from "../services/user.service.js";

export const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateUserProfile(req.user.id, req.body);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    const result = await userService.updateAvatar(req.user.id, req.file?.buffer);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const result = await userService.searchUsers(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};