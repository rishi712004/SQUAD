import express from "express";
import * as analyticsController from "../controllers/analytics.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/stats", protect, requireRole("admin"), analyticsController.getStats);

export default router;