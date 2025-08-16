import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./db/db.js";
import { connect } from "mongoose";
import userRoutes from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import cors from 'cors';
dotenv.config();

connectDB();
const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors({
  origin: 'http://localhost:5173', // your frontend URL
  credentials: true
}));
app.use(cookieParser());

app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

export default app;
