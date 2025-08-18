import * as projectService from "../services/project.service.js";
import { validationResult } from "express-validator";
import User from "../model/user.model.js";

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
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

export const addUserToProject = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId, users } = req.body;

    const loggedInUser = await User.findOne({
      email: req.user.email,
    });

    const project = await projectService.addUsersToProject({
      projectId,
      users,
      userId: loggedInUser._id,
    });

    return res.status(200).json({
      project,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

export const getProjectById = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await projectService.getProjectById({
      projectId: req.params.projectId,
    });

    return res.status(200).json({
      project,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};
