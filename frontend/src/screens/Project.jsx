import React, { useState } from "react";
import { useLocation } from "react-router-dom";

function Project() {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Dummy users list for demo
  const users = [
    { id: "1", name: "User One", email: "user1@email.com" },
    { id: "2", name: "User Two", email: "user2@email.com" },
    { id: "3", name: "User Three", email: "user3@email.com" },
    { id: "4", name: "User Four", email: "user4@email.com" },
    { id: "5", name: "User Five", email: "user5@email.com" },
  ];

  const handleUserClick = (userId) => {
    if (selectedUserIds.includes(userId)) {
      // agar already selected hai to hata do (toggle off)
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      // otherwise add kar do
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const location = useLocation();
  console.log(location.state);

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
        <div className="p-4 border-t bg-white flex items-center gap-2 shadow-inner">
          <input
            className="flex-grow p-3 px-4 border rounded-full outline-none focus:ring-2 focus:ring-indigo-400 transition"
            type="text"
            placeholder="Type your message..."
          />
          <button className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-5 py-2 rounded-full flex items-center gap-2 shadow-md">
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
          {selectedUserIds.map((id) => {
            const user = users.find((u) => u.id === id);
            return (
              <div key={id} className="p-4 hover:bg-white/10 cursor-pointer">
                • {user?.name}
              </div>
            );
          })}
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
              {users.map((user) => (
                <li
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition ${
                    selectedUserIds.includes(user.id)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-gray-50 hover:bg-indigo-100 border-gray-200"
                  }`}
                >
                  <span>
                    <span className="font-medium">{user.name}</span>
                    <span className="block text-xs text-gray-500">
                      {user.email}
                    </span>
                  </span>
                  {selectedUserIds.includes(user.id) && (
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
              onClick={() => {
                // yaha backend pe bhejna hoga
                setIsModalOpen(false);
              }}
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
