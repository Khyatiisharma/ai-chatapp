import { useContext, useState } from "react";
import { UserContext } from "../context/user.context";

import axiosInstance from "../config/axios";
export default function Home() {
  const { user, setUser } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");

  function createProject(e) {
    e.preventDefault();
    console.log("Creating project:", projectName);
    // 👉 TODO: call your /projects/create API here
    axiosInstance
      .post(
        "/projects/create",
        { name: projectName },
        {
          headers: {
            Authorization: `Bearer ${
              user?.token || localStorage.getItem("token")
            }`,
          },
        }
      )
      .then((response) => {
        console.log("Project created:", response.data);
        setIsModalOpen(false);
        setProjectName("");
      })
      .catch((error) => {
        console.error("Error creating project:", error);
      });
  }

  return (
    <main className="p-4">
      <div className="projects">
        {/* 🚀 Button with Remix Icon */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-4 border border-slate-300 rounded-md hover:bg-slate-100 flex items-center justify-center"
        >
          {" "}
          New Project
          <i className="ri-add-line text-2xl ml-2"></i>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>

            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label
                  htmlFor="projectName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
