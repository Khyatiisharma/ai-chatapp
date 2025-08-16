import projectModel from "../model/project.model.js";
















export const createProject = async ( {
  name , userId 
}) =>{
  if(!name || !userId) {
    throw new Error('Name and User ID are required');
  }

  const project = await projectModel.create({
    name,
    users: [userId]
  });

  return project;

}