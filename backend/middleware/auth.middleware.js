import jwt from "jsonwebtoken";
import userModel from "../model/user.model.js";
import redis from "../services/redis.service.js";

export const authUser = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (token) {
      token = token.replace(/^"|"$/g, ""); // remove quotes if any
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token" });
    }

    // Redis blacklist check (optional)
    if (redis) {
      const isBlacklisted = await redis.get(token);
      if (isBlacklisted) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Token blacklisted" });
      }
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure user still exists in DB
    const user = await userModel.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // Attach clean user object
    req.user = {
      id: user._id,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error("❌ Auth error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
