// import jwt from "jsonwebtoken";
// import userModel from "../model/user.model.js";
// export const authUser = (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;
//     if (!token) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }
// };

// import jwt from "jsonwebtoken";
// import userModel from "../model/user.model.js";

// export const authUser = async (req, res, next) => {
//   try {
//     let token;

//     // Check Authorization header
//     if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith("Bearer ")
//     ) {
//       token = req.headers.authorization.split(" ")[1];
//     }
//     // Or check cookies
//     else if (req.cookies && req.cookies.token) {
//       token = req.cookies.token;
//     }

//     if (!token) {
//       return res
//         .status(401)
//         .json({ message: "Unauthorized: No token provided" });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Optional: verify user still exists
//     const user = await userModel.findById(decoded.id).select("-password");
//     if (!user) {
//       return res.status(401).json({ message: "Unauthorized: User not found" });
//     }

//     // Attach user to request
//     req.user = user;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Unauthorized: Invalid token" });
//   }
// };

// import jwt from "jsonwebtoken";
// import userModel from "../model/user.model.js";
// import redis from "../services/redis.service.js";
// export const authUser = async (req, res, next) => {
//   try {
//     let token = req.headers.authorization?.split(" ")[1] || req.cookies.token;

//     if (token) {
//       token = token.replace(/^"|"$/g, ""); // remove leading/trailing quotes
//     }

//     if (!token) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const isBlacklisted = await redis.get(token);
//     if (isBlacklisted) {
//       return res
//         .status(401)
//         .json({ message: "Unauthorized: Token is blacklisted" });
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }
// };
import jwt from "jsonwebtoken";
import userModel from "../model/user.model.js";
import redis from "../services/redis.service.js";

export const authUser = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(" ")[1] || req.cookies.token;

    if (token) {
      token = token.replace(/^"|"$/g, ""); // remove quotes if any
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token" });
    }

    // ✅ Redis blacklist check (optional, can comment out for testing)
    if (redis) {
      const isBlacklisted = await redis.get(token);
      if (isBlacklisted) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Token blacklisted" });
      }
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Ensure user still exists in DB
    const user = await userModel.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // ✅ Attach clean user object
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
