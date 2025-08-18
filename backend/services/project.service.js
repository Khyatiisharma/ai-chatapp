import Project from "../model/project.model.js";
import project from "../model/project.model.js";
import mongoose from "mongoose";

// ✅ Create a new project
export const createProject = async ({ name, userId }) => {
  if (!name || !userId) {
    throw new Error("Name and User ID are required");
  }

  try {
    const project = await Project.create({
      name,
      users: [userId],
    });
    return project;
  } catch (error) {
    // Duplicate project name error
    if (error.code === 11000) {
      throw new Error(
        "Project name already exists. Please choose another name."
      );
    }
    // Other errors
    throw new Error(
      error.message || "Something went wrong while creating project"
    );
  }
};

// ✅ Get all projects for a user
export const allProjects = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required to fetch projects");
  }

  try {
    // Note: `users` array me userId check kar rahe hain
    const projects = await Project.find({ users: userId });
    return projects;
  } catch (error) {
    throw new Error(
      error.message || "Something went wrong while fetching projects"
    );
  }
};

export const addUsersToProject = async ({ projectId, users, userId }) => {
  if (!projectId) {
    throw new Error("projectId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  if (!users) {
    throw new Error("users are required");
  }

  if (
    !Array.isArray(users) ||
    users.some((userId) => !mongoose.Types.ObjectId.isValid(userId))
  ) {
    throw new Error("Invalid userId(s) in users array");
  }

  if (!userId) {
    throw new Error("userId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }
  const project = await Project.findOne({
    _id: projectId,
    users: userId,
  });

  console.log(project);

  if (!project) {
    throw new Error("User not belong to this project");
  }

  const updatedProject = await Project.findOneAndUpdate(
    {
      _id: projectId,
    },
    {
      $addToSet: {
        users: {
          $each: users,
        },
      },
    },
    {
      new: true,
    }
  );

  return updatedProject;
};

export const getProjectById = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("projectId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  const project = await Project.findOne({
    _id: projectId,
  }).populate("users");

  return project;
};
