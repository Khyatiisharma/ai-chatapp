import { Router } from "express";
import { body } from "express-validator";
import * as projectController from "../controllers/project.controller.js";
import { authUser } from "../middleware/auth.middleware.js";

const router = Router();

// 👉 Create Project
router.post(
  "/create",
  authUser, // token verify karega
  body("name").notEmpty().withMessage("Project name is required"),
  projectController.createProject
);

// 👉 Get All Projects
router.get("/all", authUser, projectController.getAllProjects);

export default router;
