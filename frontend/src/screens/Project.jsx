import React, { useState, useEffect, useContext, useRef } from "react";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [project, setProject] = useState(location.state?.project || null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { user } = useContext(UserContext);
  const messageBox = useRef(null);
  const [fileTree, setFileTree] = useState({
    "app.js": {
      content: `
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
      `,
    },
    "package.json": {
      content: `
{
  "name": "temp-server",
  "version": "1.0.0",
  "main": "app.js",
  "dependencies": {
    "express": "^4.18.2"
  }
}
      `,
    },
  });
  const [selectedFile, setSelectedFile] = useState("app.js");

  // ✅ send message
  function send() {
    if (!message.trim()) return;
    const newMsg = {
      message,
      sender: { _id: user._id, email: user.email },
      self: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    sendMessage("project-message", newMsg);
    setMessage("");
  }

  // ✅ select collaborator
  function handleUserClick(userId) {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }

  // ✅ add collaborators
  function addCollaborators() {
    axios
      .put("/projects/add-user", {
        projectId: project._id,
        users: selectedUserIds,
      })
      .then(() => setIsModalOpen(false))
      .catch((err) => console.log(err.response?.data || err.message));
  }

  // ✅ socket setup + fetch
  function WriteAiMessage(message) {
    // If message is an object, show its text property
    if (typeof message === "object" && message !== null) {
      return (
        <div className="bg-gray-800 text-white p-3 rounded-xl text-sm">
          {message.text || JSON.stringify(message)}
        </div>
      );
    }
    // If message is a JSON string, try to parse and extract text
    try {
      const parsed = JSON.parse(message);
      if (parsed && parsed.text) {
        return <div className=" text-sm">{parsed.text}</div>;
      }
    } catch (error) {
      console.error("Error parsing AI message:", error);
    }
    return (
      <div className="bg-gray-800 text-white p-3 rounded-xl text-sm">
        {message}
      </div>
    );
  }

  useEffect(() => {
    const projectId = project?._id;
    if (!projectId) return;

    initializeSocket(projectId);

    receiveMessage("project-message", (data) => {
      setMessages((prev) => [...prev, { ...data, self: false }]);
    });

    axios
      .get(`/projects/get-project/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setProject(res.data.project))
      .catch((err) => console.log(err));

    axios
      .get("/users/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setUsers(res.data.users))
      .catch((err) => console.log(err));
  }, [location.state?.project?._id]);

  // ✅ auto scroll
  useEffect(() => {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main className="h-screen w-screen flex bg-[#1e1e1e] text-gray-200 overflow-hidden font-mono">
      {/* Left: Chat */}
      <section className="h-full w-1/3 flex flex-col border-r border-gray-700 bg-[#252526]">
        {/* Header */}
        <header className="flex justify-between items-center px-4 py-3 bg-[#333333] border-b border-gray-700">
          <h2 className="font-semibold text-sm">💬 Chat</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-sm"
          >
            + Collaborator
          </button>
        </header>

        {/* Messages */}
        <div
          ref={messageBox}
          className="flex-grow p-6 flex flex-col gap-4 overflow-y-auto bg-[#1e1e1e]"
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[85%] p-3 rounded-2xl shadow-md ${
                msg.self
                  ? "self-end bg-gradient-to-r from-indigo-500 to-blue-500 text-white"
                  : "self-start bg-[#2d2d2d] border border-gray-700"
              }`}
            >
              {/* ✅ Sender Info (Always show email OR AI tag) */}
              <small
                className={`block text-xs mb-1 ${
                  msg.self ? "text-gray-200 opacity-80" : "text-gray-400"
                }`}
              >
                {msg.sender._id === "ai" ? "🤖 AI" : msg.message}
              </small>

              {/* ✅ Message Content */}
              <div
                className={`text-sm px-4 py-2 rounded-2xl shadow-sm ${
                  msg.sender._id === "ai"
                    ? "bg-gradient-to-r from-green-500 to-green-700 text-white"
                    : "bg-[#1e1e1e] text-gray-200 border border-gray-700"
                }`}
              >
                {msg.sender._id === "ai"
                  ? WriteAiMessage(msg.message)
                  : msg.message}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-700 bg-[#2d2d2d] flex items-center gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow px-3 py-2 bg-[#1e1e1e] border border-gray-600 focus:border-blue-500 focus:ring-0 outline-none text-sm"
            placeholder="Type a message..."
          />
          <button
            onClick={send}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm"
          >
            Send
          </button>
        </div>
      </section>

      {/* Right: Code Editor */}
      <section className="h-full w-2/3 flex">
        {/* File Explorer */}
        <div className="w-1/4 border-r border-gray-700 bg-[#252526]">
          <div className="px-4 py-2 text-xs uppercase tracking-wider border-b border-gray-700">
            Explorer
          </div>
          <ul className="text-sm">
            {Object.keys(fileTree).map((file) => (
              <li
                key={file}
                className={`px-4 py-2 cursor-pointer ${
                  selectedFile === file
                    ? "bg-[#37373d] text-blue-400"
                    : "hover:bg-[#2a2a2a]"
                }`}
                onClick={() => setSelectedFile(file)}
              >
                {file}
              </li>
            ))}
          </ul>
        </div>

        {/* Editor */}
        <div className="w-3/4 flex flex-col bg-[#1e1e1e]">
          <div className="flex items-center border-b border-gray-700 bg-[#2d2d2d]">
            {Object.keys(fileTree).map((file) => (
              <button
                key={file}
                onClick={() => setSelectedFile(file)}
                className={`px-4 py-2 text-sm ${
                  selectedFile === file
                    ? "bg-[#1e1e1e] border-b-2 border-blue-500 text-blue-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {file}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-auto p-4 text-green-400 text-sm">
            <pre>{fileTree[selectedFile]?.content.trim()}</pre>
          </div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#1e1e1e] border border-gray-700 w-full max-w-md p-6">
            <h3 className="text-base mb-4">Select Users</h3>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {users.map((u) => (
                <li
                  key={u._id}
                  onClick={() => handleUserClick(u._id)}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer border ${
                    selectedUserIds.includes(u._id)
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-[#2d2d2d] border-gray-700 hover:bg-[#333]"
                  }`}
                >
                  {u.email}
                  {selectedUserIds.includes(u._id) && "✔"}
                </li>
              ))}
            </ul>
            <button
              className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-sm"
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
