import projectModel from "../model/project.model.js";

// ✅ Create a new project
export const createProject = async ({ name, userId }) => {
  if (!name || !userId) {
    throw new Error("Name and User ID are required");
  }

  try {
    const project = await projectModel.create({
      name,
      users: [userId],
    });
    return project;
  } catch (error) {
    // Duplicate project name error
    if (error.code === 11000) {
      throw new Error("Project name already exists. Please choose another name.");
    }
    // Other errors
    throw new Error(error.message || "Something went wrong while creating project");
  }
};

// ✅ Get all projects for a user
export const allProjects = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required to fetch projects");
  }

  try {
    // Note: `users` array me userId check kar rahe hain
    const projects = await projectModel.find({ users: userId });
    return projects;
  } catch (error) {
    throw new Error(error.message || "Something went wrong while fetching projects");
  }
};
