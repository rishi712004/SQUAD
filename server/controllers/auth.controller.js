import * as authService from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.rotateRefreshToken(req.body.token);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logoutUser(req.body.token);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

export const oauthCallback = async (req, res, next) => {
  try {
    const { access, refresh } = await authService.handleOAuthLogin(req.user);
    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?access=${access}&refresh=${refresh}`
    );
  } catch (err) {
    next(err);
  }
};