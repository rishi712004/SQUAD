import express from "express";
import passport from "passport";
import * as authController from "../controllers/auth.controller.js";
import {
  validateBody,
  validateEmail,
  validatePassword,
} from "../middleware/validate.middleware.js";

const router = express.Router();

router.post(
  "/register",
  validateBody(["name", "email", "password"]),
  validateEmail,
  validatePassword,
  authController.register
);

router.post(
  "/login",
  validateBody(["email", "password"]),
  authController.login
);

router.post("/refresh", validateBody(["token"]), authController.refreshToken);

router.post("/logout", validateBody(["token"]), authController.logout);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  authController.oauthCallback
);

// GitHub OAuth
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"], session: false })
);
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/login" }),
  authController.oauthCallback
);

export default router;