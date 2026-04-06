import express from "express";
import * as socialController from "../controllers/social.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/follow/:targetId", protect, socialController.toggleFollow);
router.get("/notifications", protect, socialController.getNotifications);
router.put("/notifications/read-all", protect, socialController.markAllRead);
router.put("/notifications/:id/read", protect, socialController.markOneRead);

export default router;