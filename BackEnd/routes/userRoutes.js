
import express from "express";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  resetPassword,
  updateDeliveryAddress,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { getAllUsers } from "../controllers/userController.js";
import { admin } from "../middleware/adminMiddleware.js";
import uploadAvatar from "../middleware/uploadAvatar.js";

const router = express.Router();

// Auth
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/logout", protect, (req, res) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Logged out successfully" });
});

// Profile
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, uploadAvatar.single("avatar"), updateUserProfile);
router.put("/update-password", protect, updateUserPassword);
router.put("/reset-password/:token", resetPassword);

// ADMIN — GET ALL USERS
router.get("/admin/all", protect, admin, getAllUsers);

// GET ADMIN ID (for frontend to send notifications)
router.get("/admin/id", protect, asyncHandler(async (req, res) => {
  const adminUser = await User.findOne({ isAdmin: true });
  if (!adminUser) {
    res.status(404);
    throw new Error("Admin not found");
  }
  res.json({ adminId: adminUser._id });
}));

// Delivery Address
router.put("/delivery-address", protect, updateDeliveryAddress);

// Delete Account (User self-delete)
router.delete("/delete", protect, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN: Delete User by ID
router.delete("/admin/delete/:id", protect, admin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own admin account" });
    }

    const userToDelete = await User.findById(id);

    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    await userToDelete.deleteOne();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;



