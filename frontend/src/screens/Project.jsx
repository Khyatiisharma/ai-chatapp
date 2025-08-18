import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import axios from "../config/axios";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import { UserContext } from "../context/user.context.jsx";

function Project() {
  const location = useLocation();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [project, setProject] = useState(location.state?.project || null);
  const [message, setMessage] = useState(""); // ✅ fixed: initial empty string
  const { user } = useContext(UserContext);

  console.log(location.state);

  // ✅ function fixed: send message
  function send() {
    if (!message.trim()) return; // empty msg avoid
    sendMessage("project-message", {
      message,
      sender: user._id,
    });
    setMessage(""); // clear input
  }

  // ✅ function fixed: toggle user selection
  function handleUserClick(userId) {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }

  function addCollaborators() {
    axios
      .put(
        "/projects/add-user", // ✅ fixed: no need hardcoded localhost
        {
          projectId: project._id,
          users: selectedUserIds,
        }
        // {
        //   headers: {
        //     Authorization: `Bearer ${localStorage.getItem("token")}`,
        //   },
        // }
      )
      .then((res) => {
        console.log(res.data);
        setIsModalOpen(false);
      })
      .catch((err) => console.log(err.response?.data || err.message));
  }

  useEffect(() => {
    const projectId = project?._id;
    if (!projectId) return;
    initializeSocket(projectId);

    // Listen for messages
    receiveMessage("project-message", (data) => {
      console.log("📩 Incoming Message:", data);
    });

    // Fetch project
    axios
      .get(`/projects/get-project/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setProject(res.data.project))
      .catch((err) => console.log(err));

    // Fetch all users
    axios
      .get("/users/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setUsers(res.data.users))
      .catch((err) => console.log(err));
  }, [location.state?.project?._id]);

  return (
    <main className="h-screen w-screen flex bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
      {/* Left Side (Chat UI) → 1/3 */}
      <section className="h-full w-1/3 flex flex-col bg-white shadow-xl border-r relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition"
          >
            <i className="ri-add-fill"></i>
            Add Collaborator
          </button>
          <h2 className="font-semibold text-lg tracking-wide">💬 Chat</h2>
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-2 hover:bg-white/20 rounded-full"
          >
            <i className="ri-group-line text-xl"></i>
          </button>
        </header>

        {/* Messages */}
        <div className="messages-box flex-grow p-6 flex flex-col gap-4 overflow-y-auto bg-gray-50">
          <div className="self-start max-w-[85%] bg-white border shadow p-3 rounded-2xl">
            <small className="text-gray-400 text-xs">example@gmail.com</small>
            <p className="text-sm mt-1">Hey 👋 how are you?</p>
          </div>
          <div className="self-end max-w-[85%] bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow p-3 rounded-2xl">
            <small className="opacity-80 text-xs">me@gmail.com</small>
            <p className="text-sm mt-1">I'm good! What about you?</p>
          </div>
          <div className="self-start max-w-[85%] bg-white border shadow p-3 rounded-2xl">
            <small className="text-gray-400 text-xs">example@gmail.com</small>
            <p className="text-sm mt-1">All good here 😄</p>
          </div>
        </div>

        {/* Input Field */}
        <div className="p-4 bg-white flex items-center gap-2 shadow-inner">
          <input
            value={message} // ✅ bind message state
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow p-3 px-4 border rounded-full outline-none focus:ring-2 focus:ring-indigo-400 transition"
            type="text"
            placeholder="Type your message..."
          />
          <button
            onClick={send}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-5 py-2 rounded-full flex items-center gap-2 shadow-md"
          >
            <i className="ri-send-plane-fill"></i>
            Send
          </button>
        </div>
      </section>

      {/* Right Side (AI Integration area) → 2/3 */}
      <section className="h-full w-2/3 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-400 relative">
        <p className="text-lg font-medium animate-pulse">
          🤖 AI Assistant coming soon...
        </p>

        {/* Sliding Side Panel */}
        <div
          className={`sidePanel fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-indigo-600 to-blue-600 text-white shadow-lg transform transition-transform duration-300 z-20 ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 font-semibold border-b border-white/20">
            👥 Team Members
          </div>
          {project?.users?.length > 0 ? (
            project.users.map((user) => (
              <div
                key={user._id}
                className="p-4 hover:bg-white/10 cursor-pointer"
              >
                • {user.email}
              </div>
            ))
          ) : (
            <div className="p-4 text-sm text-gray-200">
              No collaborators yet
            </div>
          )}
        </div>
      </section>

      {/* Modal for users list */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 relative w-full max-w-md mx-auto animate-fadeIn">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-4 text-center">
              Select Users
            </h3>
            <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {users.map((u) => (
                <li
                  key={u._id}
                  onClick={() => handleUserClick(u._id)} // ✅ fixed
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition ${
                    selectedUserIds.includes(u._id)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-gray-50 hover:bg-indigo-100 border-gray-200"
                  }`}
                >
                  <span>
                    <span className="font-medium">{u.email}</span>
                    <span className="block text-xs text-gray-500">
                      {u.email}
                    </span>
                  </span>
                  {selectedUserIds.includes(u._id) && (
                    <i className="ri-check-line text-xl"></i>
                  )}
                </li>
              ))}
            </ul>
            {selectedUserIds.length > 0 && (
              <div className="mt-4 text-center text-sm text-indigo-600">
                Selected User IDs:{" "}
                <span className="font-mono">{selectedUserIds.join(", ")}</span>
              </div>
            )}
            {/* Add Collaborators Button */}
            <button
              className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-2 rounded-full shadow-lg"
              onClick={addCollaborators}
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Project;
