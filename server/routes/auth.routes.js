import express from "express";
import { register, login, refreshToken, logout } from "../controllers/auth.controller.js";
import passport from "passport";
import { signAccess, signRefresh } from "../utils/tokens.js";
import User from "../models/User.js";

const r = express.Router();

r.post("/register", register);
r.post("/login", login);
r.post("/refresh", refreshToken);
r.post("/logout", logout);

// Google OAuth
r.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
r.get("/google/callback", passport.authenticate("google", { session: false }), async (req, res) => {
  const access = signAccess({ id: req.user._id, role: req.user.role });
  const refresh = signRefresh({ id: req.user._id });
  req.user.refreshTokens.push(refresh);
  await req.user.save({ validateBeforeSave: false });
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?access=${access}&refresh=${refresh}`);
});

export default r;