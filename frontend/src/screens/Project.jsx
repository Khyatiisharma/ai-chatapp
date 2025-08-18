import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "../config/axios";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import { UserContext } from "../context/user.context.jsx";
import Markdown from "markdown-to-jsx";

function Project() {
  const location = useLocation();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [project, setProject] = useState(location.state?.project || null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // ✅ chat messages state
  const { user } = useContext(UserContext);
  const messageBox = useRef(null);
  const [fileTree, setFileTree] = useState({});

  function send() {
    if (!message.trim()) return;

    // apna message state me add karo
    const newMsg = {
      message,
      sender: { _id: user._id, email: user.email },
      self: true,
    };
    setMessages((prev) => [...prev, newMsg]);

    // server ko bhejo
    sendMessage("project-message", {
      message,
      sender: { _id: user._id, email: user.email },
    });

    setMessage("");
  }

  function handleUserClick(userId) {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }

  function addCollaborators() {
    axios
      .put("/projects/add-user", {
        projectId: project._id,
        users: selectedUserIds,
      })
      .then((res) => {
        console.log(res.data);
        setIsModalOpen(false);
      })
      .catch((err) => console.log(err.response?.data || err.message));
  }
  // function WriteAiMessage(message) {
  //   const msgobj = JSON.parse(message);
  //   return (
  //     <Markdown
  //       className="prose prose-sm max-w-none text-white"
  //       children={msgobj.text}
  //       options={{ overrides: { code: SyntaxHighlighter } }}
  //     >
  //       <SyntaxHighlighter language="javascript" style={docco}>
  //         {msgobj.code}
  //       </SyntaxHighlighter>
  //     </Markdown>
  //   );
  // }
  function WriteAiMessage(message) {
    try {
      // Agar AI ka response code block ke andar aaya ho to clean kar do
      let cleanMsg = message
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      // Ab safe parse
      const parsed = JSON.parse(cleanMsg);
      return (
        <pre className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white p-3 rounded-xl text-wrap overflow-auto">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    } catch (err) {
      // Agar parse fail ho gaya to plain text dikhao
      return (
        <div className="bg-gray-800 text-white p-3 rounded-xl text-sm">
          {message}
        </div>
      );
    }
  }

  useEffect(() => {
    const projectId = project?._id;
    if (!projectId) return;

    initializeSocket(projectId);

    // ✅ incoming messages ko UI me append karo
    receiveMessage("project-message", (data) => {
      console.log("📩 Incoming:", data);
      setMessages((prev) => [...prev, { ...data, self: false }]);
    });

    // project fetch
    axios
      .get(`/projects/get-project/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setProject(res.data.project))
      .catch((err) => console.log(err));

    // users fetch
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
        <div
          ref={messageBox}
          className="messages-box flex-grow p-6 flex flex-col gap-4 overflow-y-auto bg-gray-50"
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[85%] p-3 rounded-2xl shadow ${
                msg.self
                  ? "self-end bg-gradient-to-r from-indigo-500 to-blue-500 text-white"
                  : "self-start bg-white border"
              }`}
            >
              <small
                className={`block text-xs mb-1 ${
                  msg.self ? "opacity-80" : "text-gray-400"
                }`}
              >
                {msg.sender._id === "ai" ? "🤖 AI Assistant" : msg.sender.email}
              </small>

              <div
                className={`text-sm px-4 py-2 rounded-2xl shadow-md max-w-[90%] ${
                  msg.sender._id === "ai"
                    ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white"
                    : "bg-white border text-gray-800"
                }`}
              >
                {msg.sender._id === "ai"
                  ? WriteAiMessage(msg.message)
                  : msg.message}
              </div>
            </div>
          ))}
        </div>
        {/* {msg.sender.email}
         */}
        {/* {msg.sender._id === "ai" ? "🤖 AI Assistant" : msg.sender.email}
                </small>
                {/* <p className="text-sm">{msg.message}</p> */}
        {/* <div className="text-sm overflow-auto bg-slate-950 text-white">
                  {msg.sender._id === "ai" ? (
                    <Markdown className="prose prose-sm max-w-none">
                      {msg.message}
                    </Markdown>
                  ) : (
                    msg.message
                  )}
                </div>
              <

          {/* Input Field */}
        <div className="p-4 bg-white flex items-center gap-2 shadow-inner">
          <input
            value={message}
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
            project.users.map((u) => (
              <div key={u._id} className="p-4 hover:bg-white/10 cursor-pointer">
                • {u.email}
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
                  onClick={() => handleUserClick(u._id)}
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

  // return (
  //   <main className="h-screen w-screen flex bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white overflow-hidden">
  //     {/* Left Side (Chat UI) */}
  //     <section className="h-full w-1/3 flex flex-col backdrop-blur-xl bg-white/10 border-r border-white/10 shadow-xl relative z-10">
  //       {/* Header */}
  //       <header className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-600/80 to-blue-600/80 text-white rounded-b-xl shadow-lg">
  //         <button
  //           onClick={() => setIsModalOpen(true)}
  //           className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-xl transition-all"
  //         >
  //           <i className="ri-add-fill"></i>
  //           Add
  //         </button>
  //         <h2 className="font-semibold text-lg tracking-wide">💬 Chat</h2>
  //         <button
  //           onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
  //           className="p-2 hover:bg-white/20 rounded-full"
  //         >
  //           <i className="ri-group-line text-xl"></i>
  //         </button>
  //       </header>

  //       {/* Messages */}
  //       <div
  //         ref={messageBox}
  //         className="messages-box flex-grow p-6 flex flex-col gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-transparent scroll-smooth"
  //       >
  //         {messages.map((msg, idx) => (
  //           <div
  //             key={idx}
  //             className={`max-w-[85%] p-3 rounded-2xl shadow-lg backdrop-blur-lg ${
  //               msg.self
  //                 ? "self-end bg-gradient-to-r from-indigo-500 to-blue-500 text-white"
  //                 : "self-start bg-white/20 border border-white/10 text-white"
  //             }`}
  //           >
  //             <small
  //               className={`block text-xs mb-1 ${
  //                 msg.self ? "opacity-80" : "text-gray-300"
  //               }`}
  //             >
  //               {msg.sender._id === "ai" ? "🤖 AI Assistant" : msg.sender.email}
  //             </small>

  //             <div
  //               className={`text-sm px-4 py-2 rounded-2xl shadow-md ${
  //                 msg.sender._id === "ai"
  //                   ? "bg-gradient-to-r from-green-400 to-green-600 text-white  text-wrap overflow-auto"
  //                   : "bg-white/10 text-gray-100"
  //               }`}
  //             >
  //               {msg.sender._id === "ai" ? (
  //                 <Markdown className="prose prose-sm max-w-none text-white">
  //                   {msg.message}
  //                 </Markdown>
  //               ) : (
  //                 msg.message
  //               )}
  //             </div>
  //           </div>
  //         ))}
  //       </div>

  //       {/* Input Field */}
  //       <div className="p-4 bg-white/10 flex items-center gap-2 backdrop-blur-lg border-t border-white/10">
  //         <input
  //           value={message}
  //           onChange={(e) => setMessage(e.target.value)}
  //           className="flex-grow p-3 px-4 rounded-full bg-white/20 border border-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-400 transition"
  //           type="text"
  //           placeholder="Type your message..."
  //         />
  //         <button
  //           onClick={send}
  //           className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-5 py-2 rounded-full flex items-center gap-2 shadow-lg"
  //         >
  //           <i className="ri-send-plane-fill"></i>
  //         </button>
  //       </div>
  //     </section>

  //     {/* Right Side */}
  //     <section className="h-full w-2/3 bg-gradient-to-br from-slate-800 via-slate-900 to-black flex items-center justify-center relative">
  //       <p className="text-lg font-medium text-gray-400 animate-pulse">
  //         🤖 AI Assistant coming soon...
  //       </p>

  //       {/* Side Panel */}
  //       <div
  //         className={`sidePanel fixed top-0 left-0 h-full w-64 backdrop-blur-xl bg-white/10 border-r border-white/20 text-white shadow-xl transform transition-transform duration-300 z-20 ${
  //           isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
  //         }`}
  //       >
  //         <div className="p-4 font-semibold border-b border-white/20">
  //           👥 Team Members
  //         </div>
  //         <div className="overflow-y-auto h-[90%] scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent scroll-smooth">
  //           {project?.users?.length > 0 ? (
  //             project.users.map((u) => (
  //               <div
  //                 key={u._id}
  //                 className="p-4 hover:bg-white/10 cursor-pointer transition"
  //               >
  //                 • {u.email}
  //               </div>
  //             ))
  //           ) : (
  //             <div className="p-4 text-sm text-gray-300">
  //               No collaborators yet
  //             </div>
  //           )}
  //         </div>
  //       </div>
  //     </section>

  //     {/* Modal */}
  //     {isModalOpen && (
  //       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
  //         <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 relative w-full max-w-md mx-auto animate-fadeIn border border-white/20">
  //           <button
  //             className="absolute top-2 right-2 text-gray-300 hover:text-white text-2xl"
  //             onClick={() => setIsModalOpen(false)}
  //           >
  //             &times;
  //           </button>
  //           <h3 className="text-lg font-semibold mb-4 text-center text-white">
  //             Select Users
  //           </h3>
  //           <ul className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-transparent scroll-smooth">
  //             {users.map((u) => (
  //               <li
  //                 key={u._id}
  //                 onClick={() => handleUserClick(u._id)}
  //                 className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition ${
  //                   selectedUserIds.includes(u._id)
  //                     ? "bg-indigo-600/80 text-white border-indigo-600"
  //                     : "bg-white/10 hover:bg-white/20 border-white/20 text-gray-200"
  //                 }`}
  //               >
  //                 <span>
  //                   <span className="font-medium">{u.email}</span>
  //                 </span>
  //                 {selectedUserIds.includes(u._id) && (
  //                   <i className="ri-check-line text-xl"></i>
  //                 )}
  //               </li>
  //             ))}
  //           </ul>
  //           {selectedUserIds.length > 0 && (
  //             <div className="mt-4 text-center text-sm text-indigo-300">
  //               Selected User IDs:{" "}
  //               <span className="font-mono">{selectedUserIds.join(", ")}</span>
  //             </div>
  //           )}
  //           <button
  //             className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-2 rounded-full shadow-lg"
  //             onClick={addCollaborators}
  //           >
  //             Add Collaborators
  //           </button>
  //         </div>
  //       </div>
  //     )}
  //   </main>
  // );
}

export default Project;
