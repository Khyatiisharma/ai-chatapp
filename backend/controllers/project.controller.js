
import projectModel from "../model/project.model.js";
import * as projectService from "../services/project.service.js";
import { validationResult } from "express-validator";

export const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized: invalid token" });
    }

    const { name } = req.body;

    // ✅ Directly use userId from JWT
    const newProject = await projectService.createProject({
      name,
      userId: req.user.id,
    });

    return res.status(201).json(newProject);
  } catch (error) {
    console.error("Error creating project:", error);

    if (error.code === 11000) {
      return res.status(400).json({ message: "Project already exists" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    // loggedInUser._id ya req.user.id use karo
    const allProjects = await projectService.allProjects(req.user.id); // <-- sirf id pass karo
    return res.status(200).json(allProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};
