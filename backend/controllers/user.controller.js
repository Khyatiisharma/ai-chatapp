import userModel from "../model/user.model.js";

import redis from "../services/redis.service.js";

import userService from "../services/user.service.js";

import { validationResult } from "express-validator";

export const createUserController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await userService.createUser(email, password);
    const token = user.generateJWT();
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email }).select("+password");
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = user.generateJWT();
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logoutController = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;
    redis.set(token, "logged_out", "EX", 3600);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const loggedinUser = await userModel.findOne({ email: req.user.email });
    if (!loggedinUser) {
      return res.status(404).json({ message: "Logged in user not found" });
    }

    const users = await userModel
      .find({ _id: { $ne: loggedinUser._id } })
      .select("-password");

    return res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
