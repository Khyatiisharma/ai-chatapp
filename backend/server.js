import "dotenv/config";
import http from "http";
import app from "./index.js"; // ✅ Express app
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import projectModel from "./model/project.model.js";
import * as ai from "./services/ai.service.js"; // ✅ AI service import

const port = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Attach socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // frontend origin
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Middleware for socket authentication
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1];
    const projectId = socket.handshake.query.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid projectId"));
    }

    socket.project = await projectModel.findById(projectId);
    if (!socket.project) {
      return next(new Error("Project not found"));
    }

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(new Error("Authentication error"));
    }

    socket.user = decoded; // save user info in socket

    next();
  } catch (error) {
    console.error("Socket Auth Error:", error.message);
    next(error);
  }
});

// ✅ Handle socket connections
io.on("connection", (socket) => {
  socket.roomId = socket.project._id.toString();
  console.log("✅ user connected:", socket.user.email);

  // join project room
  socket.join(socket.roomId);

  // listen for project messages
  socket.on("project-message", async (data) => {
    const payload = {
      message: data.message,
      sender: {
        _id: socket.user._id,
        email: socket.user.email,
      },
    };

    // Sirf dusre users ko bheje
    socket.broadcast.to(socket.roomId).emit("project-message", payload);

    // ✅ AI mention check
    if (data.message.includes("@ai")) {
      const prompt = data.message.replace("@ai", "").trim();

      try {
        const result = await ai.generateResult(prompt);

        io.to(socket.roomId).emit("project-message", {
          message: result,
          sender: { _id: "ai", email: "ai@bot.com" },
        });
      } catch (err) {
        io.to(socket.roomId).emit("project-message", {
          message: "AI error: " + err.message,
          sender: { _id: "ai", email: "ai@bot.com" },
        });
      }
    }
  });

  // handle disconnect
  socket.on("disconnect", () => {
    console.log("❌ user disconnected:", socket.user.email);
    socket.leave(socket.roomId);
  });
});

// ✅ Start server
server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
