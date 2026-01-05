// routes/adminRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/order.js";
import { blockUser, unblockUser } from "../controllers/userController.js";

const router = express.Router();

router.get(
  "/stats",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    res.json({ totalUsers, totalProducts, totalOrders });
  })
);

// Block user
router.put("/block-user/:id", protect, admin, blockUser);

// Unblock user
router.put("/unblock-user/:id", protect, admin, unblockUser);

export default router;
