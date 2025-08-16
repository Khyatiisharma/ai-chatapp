import { Router } from "express";
import { body } from "express-validator";
import * as projectController from "../controllers/project.controller.js";
import { authUser } from "../middleware/auth.middleware.js";  // ✅ सही नाम

const router = Router();

router.post(
  "/create",
  authUser,   // ✅ यहाँ भी वही नाम
  body("name").isString().withMessage("Name is required"),
  projectController.createProject
);

export default router;
