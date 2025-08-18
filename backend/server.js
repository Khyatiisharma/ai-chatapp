import "dotenv/config";
import http from "http";
import app from "./index.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import projectModel from "./model/project.model.js";

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

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

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return next(new Error("Authentication error"));
    }

    socket.user = decoded; // user info save

    next();
  } catch (error) {
    next(error);
  }
});

io.on("connection", (socket) => {
  socket.roomId = socket.project._id.toString();
  console.log("✅ user connected:", socket.user.email);

  socket.join(socket.roomId);

  socket.on("project-message", async (data) => {
    const payload = {
      message: data.message,
      sender: {
        _id: socket.user._id,
        email: socket.user.email,
      },
    };

    // Sirf dusre users ko bheje, sender ko nahi
    socket.broadcast.to(socket.roomId).emit("project-message", payload);

    // AI mention check (ye sabko bhejna ho toh io.to use karo)
    if (data.message.includes("@ai")) {
      const prompt = data.message.replace("@ai", "");
      const result = await generateResult(prompt);

      io.to(socket.roomId).emit("project-message", {
        message: result,
        sender: { _id: "ai", email: "ai@bot.com" },
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ user disconnected:", socket.user.email);
    socket.leave(socket.roomId);
  });
});

server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
