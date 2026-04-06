import express from "express";
import * as matchController from "../controllers/match.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/users", protect, matchController.getMatchedUsers);
router.get("/projects", protect, matchController.getMatchedProjects);

export default router;