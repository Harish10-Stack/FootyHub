import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Notification from "../models/Notification.js";
import { validatePassword } from "../utils/passwordValidator.js";


// 🔔 Helper: Send Live Welcome Notification
const sendWelcomeNotification = async (req, user) => {
  const notification = await Notification.create({
    title: "🎉 Welcome Back!",
    message: `Hi ${user.name}, glad to see you again 😊`,
    user: user._id,
    type: "welcome",
  });

  // Send in real-time if user socket is online
  const socketId = req.onlineUsers?.get(user._id.toString());
  if (socketId) {
    req.io.to(socketId).emit("new-notification", notification);
  }
};


// Utility function to normalize deliveryAddress
const normalizeDeliveryAddress = (address = {}) => ({
  fullName: address?.fullName || "",
  address: address?.address || "",
  city: address?.city || "",
  state: address?.state || "",
  postalCode: address?.postalCode || "",
  country: address?.country || "",
  phone: address?.phone || "",
});

// LOGIN
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && user.status === "blocked") {
    res.status(403);
    throw new Error("Your account has been blocked. Contact support.");
  }

  if (user && (await user.matchPassword(password))) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    // Clear unread notifications for admin on login
    if (user.isAdmin) {
      await Notification.updateMany({ user: user._id, read: false }, { read: true });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      votedPlayer: user.votedPlayer,
      deliveryAddress: normalizeDeliveryAddress(user.deliveryAddress || {}),
      token,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// REGISTER
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    res.status(400);
    throw new Error(passwordValidation.errors.join(", "));
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({ name, email, password });
  if (user) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      status: user.status,
      deliveryAddress: normalizeDeliveryAddress(user.deliveryAddress || {}),
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// GET PROFILE
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({
    ...user._doc,
    deliveryAddress: normalizeDeliveryAddress(user.deliveryAddress || {}),
  });
});

// UPDATE PROFILE
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, email, currentPassword } = req.body;
  if (!currentPassword || !(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Password is incorrect");
  }

  if (name) user.name = name;
  if (email) user.email = email;

  // Handle avatar upload
  if (req.file) {
    user.avatar = `/uploads/avatars/${req.file.filename}`;
  }

  // Handle avatar removal
  if (req.body.removeAvatar) {
    user.avatar = null;
  }

  const updatedUser = await user.save();
  res.json({
    message: "Profile updated successfully",
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      status: updatedUser.status,
      deliveryAddress: normalizeDeliveryAddress(updatedUser.deliveryAddress || {}),
    },
  });
});

// UPDATE DELIVERY ADDRESS
export const updateDeliveryAddress = asyncHandler(async (req, res) => {
  const { fullName, address, city, state, postalCode, country, phone } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.deliveryAddress = { fullName, address, city, state, postalCode, country, phone };
  const updatedUser = await user.save();

  res.json({
    message: "Delivery address updated successfully",
    deliveryAddress: normalizeDeliveryAddress(updatedUser.deliveryAddress || {}),
  });
});

// RESET PASSWORD
export const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid token");
  }

  // Validate password strength
  const passwordValidation = validatePassword(req.body.password);
  if (!passwordValidation.isValid) {
    res.status(400);
    throw new Error(passwordValidation.errors.join(", "));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
});

// UPDATE PASSWORD
export const updateUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  // Validate new password strength
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    res.status(400);
    throw new Error(passwordValidation.errors.join(", "));
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: "Password updated successfully" });
});

// ==========================
// ADMIN: GET ALL USERS
// ==========================
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");

    res.json(
      users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        status: user.status,
        votedPlayer: user.votedPlayer,
        deliveryAddress: normalizeDeliveryAddress(user.deliveryAddress),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }))
    );
});

// ==========================
// ADMIN: BLOCK USER
// ==========================
export const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.isAdmin) {
    res.status(400);
    throw new Error("Cannot block an admin user");
  }

  user.status = "blocked";
  await user.save();

  res.json({ message: "User blocked successfully" });
});

// ==========================
// ADMIN: UNBLOCK USER
// ==========================
export const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.status = "active";
  await user.save();

  res.json({ message: "User unblocked successfully" });
});









