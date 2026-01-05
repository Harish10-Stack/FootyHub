import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import { createOrder, getMyOrders, checkProductPurchased } from "../controllers/orderController.js";
import Order from "../models/order.js";

const router = express.Router();

// Create order
router.post("/", protect, createOrder);

// Get orders for logged-in user
router.get("/my-orders", protect, getMyOrders);

// Admin: Get all orders
router.get("/all", protect, admin, asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("orderItems.product", "name img price")
    .sort({ createdAt: -1 });

  res.json(orders);
}));

// Check if user purchased a product
router.get("/check/:productId", protect, checkProductPurchased);

export default router;













