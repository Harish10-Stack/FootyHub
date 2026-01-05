import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// Protect middleware — verifies token from HTTP-only cookie or Authorization header
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in cookies first (preferred for security)
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // Fallback to Authorization header (for API testing or frontend issues)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        console.error("User not found for this token");
        res.status(401);
        throw new Error("User not found for this token");
      }

      // Check if user is blocked
      if (req.user.status !== "active") {
        console.error("User account is blocked");
        res.status(403).json({ message: "Your account is blocked." });
        return;
      }

      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    console.error("No token provided");
    res.status(401).json({ message: "Not authorized, no token" });
  }
});

// Admin middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as admin");
  }
};










