// backend/test-socket.js
import { io } from "socket.io-client";

// yaha apna backend ka URL dal
const socket = io("http://localhost:5000", {
  auth: {
    token: "PUT_YOUR_JWT_TOKEN_HERE", // <- apna JWT token daal yaha
  },
  query: {
    projectId: "PUT_PROJECT_ID_HERE", // <- apna projectId daal yaha
  },
});

socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection error:", err.message);
});

socket.on("disconnect", () => {
  console.log("⚠️ Disconnected from server");
});

// example: message receive
socket.on("project-message", (data) => {
  console.log("📩 New project message:", data);
});

// example: apna msg bhejna
setTimeout(() => {
  socket.emit("send-message", {
    projectId: "PUT_PROJECT_ID_HERE",
    message: "Hello from test script 🚀",
  });
}, 3000);
