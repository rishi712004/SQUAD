import express from "express";
import * as projectController from "../controllers/project.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";

const router = express.Router();

router.get("/feed", protect, projectController.getFeed);
router.post(
  "/",
  protect,
  validateBody(["title", "description"]),
  projectController.createProject
);
router.get("/:id", protect, projectController.getProject);
router.put("/:id", protect, projectController.updateProject);
router.delete("/:id", protect, projectController.deleteProject);
router.post("/:id/apply", protect, projectController.applyToProject);
router.post("/:id/accept/:applicantId", protect, projectController.acceptApplicant);
router.post("/:id/reject/:applicantId", protect, projectController.rejectApplicant);

export default router;