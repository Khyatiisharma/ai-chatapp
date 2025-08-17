import { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
import axiosInstance from "../config/axios";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  function createProject(e) {
    e.preventDefault();
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
        setIsModalOpen(false);
        setProjectName("");
        setProjects((prev) => [...prev, response.data.project]);
      })
      .catch((error) => {
        console.error("Error creating project:", error);
      });
  }

  useEffect(() => {
    axiosInstance
      .get("/projects/all")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setProjects(res.data);
        } else {
          setProjects(res.data.projects || []);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">📂 Your Projects</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow hover:scale-105 transition-transform flex items-center gap-2"
        >
          <i className="ri-add-line text-xl"></i> New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {projects.map((project) => (
          <div
            key={project._id}
            onClick={() => navigate("/project", { state: { project } })}
            className="cursor-pointer p-5 rounded-2xl bg-white shadow hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
          >
            {/* Project Name */}
            <h3 className="text-lg font-semibold text-gray-800 text-center truncate">
              {project.name}
            </h3>

            {/* Members */}
            <div className="flex items-center justify-center gap-2 text-gray-500 mt-4">
              <i className="ri-user-line text-lg"></i>
              <span className="text-sm">
                {project.users?.length || 0} Members
              </span>
            </div>
          </div>
        ))}

        {/* Empty State (no projects yet) */}
        {projects.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">
            <i className="ri-folder-open-line text-5xl mb-4"></i>
            <p className="text-lg">No projects yet. Create your first one!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              🚀 Create New Project
            </h2>

            <form onSubmit={createProject} className="space-y-5">
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
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600 shadow"
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
