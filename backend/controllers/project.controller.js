import projectModel from "../model/project.model.js";
import UserModel from "../model/user.model.js";
import * as projectService from "../services/project.service.js";
import { validationResult } from "express-validator";

export const createProject = async (req, res) => { 
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: user not found in request" });
    }

    // ✅ Token से user id निकाली
    const loggedInUser = await UserModel.findById(req.user.id);
    if (!loggedInUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = loggedInUser._id;

    // ✅ Project create किया
    const newProject = await projectService.createProject({
      name,
      userId
    });

    res.status(201).json(newProject);
  } catch (error) { 
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
