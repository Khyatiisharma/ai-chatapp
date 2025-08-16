// import projectModel from "../model/project.model.js";

// export const createProject = async ( {
//   name , userId
// }) =>{
//   if(!name || !userId) {
//     throw new Error('Name and User ID are required');
//   }

//   const project = await projectModel.create({
//     name,
//     users: [userId]
//   });

//   return project;

//}

import projectModel from "../model/project.model.js";

export const createProject = async ({ name, userId }) => {
  try {
    if (!name || !userId) {
      throw new Error("Name and User ID are required");
    }

    const project = await projectModel.create({
      name,
      users: [userId],
    });

    return project;
  } catch (error) {
    // Handle duplicate key error (MongoError code 11000)
    if (error.code === 11000) {
      throw new Error(
        "Project name already exists. Please choose another name."
      );
    }

    // Re-throw other errors
    throw new Error(
      error.message || "Something went wrong while creating project"
    );
  }
};

export const getAllProjects = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required to fetch projects");
  }
  try {
    const projects = await projectModel.find({ userId });
    return allProjects;
  } catch (error) {
    throw new Error(
      error.message || "Something went wrong while fetching projects"
    );
  }
};
