import express from "express";
import * as userController from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/me", protect, userController.getMe);
router.put("/me", protect, userController.updateProfile);
router.post("/me/avatar", protect, upload.single("avatar"), userController.uploadAvatar);
router.get("/search", protect, userController.searchUsers);
router.get("/:id", protect, userController.getProfile);

export default router;