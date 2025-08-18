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

router.put(
  "/add-user",
  authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  body("users")
    .isArray({ min: 1 })
    .withMessage("Users must be an array of strings")
    .bail()
    .custom((users) => users.every((user) => typeof user === "string"))
    .withMessage("Each user must be a string"),
  projectController.addUserToProject
);

router.get(
  "/get-project/:projectId",
  authUser,
  projectController.getProjectById
);

export default router;
