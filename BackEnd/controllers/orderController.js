import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Order from "../models/order.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// ---------------------- CREATE ORDER ----------------------
export const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, totalPrice, deliveryAddress } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  const finalDeliveryAddress =
    deliveryAddress?.address
      ? deliveryAddress
      : user.deliveryAddress?.address
      ? user.deliveryAddress
      : null;

  if (!finalDeliveryAddress) {
    res.status(400);
    throw new Error("Missing Delivery Address");
  }

  // Ensure each orderItem has proper numeric price and image
  const sanitizedOrderItems = orderItems.map((item) => ({
    product: new mongoose.Types.ObjectId(item.productId || item.product),
    name: item.name,
    qty: item.qty || item.quantity || 1,
    price:
      typeof item.price === "number"
        ? item.price
        : parseFloat(String(item.price || "0").replace(/[₹,]/g, "")) || 0,
    image: item.image || "",
  }));



  // Create order immediately marked as completed
  const order = await Order.create({
    user: user._id,
    orderItems: sanitizedOrderItems,
    deliveryAddress: finalDeliveryAddress,
    totalPrice: Math.round(totalPrice),
    status: "completed",
    isPaid: true, // ✅ make sure this is true
 });


  // Create notification
  const notif = await Notification.create({
    title: "🛍 Order Placed",
    message: `Your order #${order._id.toString().slice(-8)} has been placed successfully.`,
    user: user._id,
    type: "order",
  });

  const socketId = req.onlineUsers?.get(user._id.toString());
  if (socketId) req.io.to(socketId).emit("new-notification", notif);

  // Emit product-purchased event for real-time updates
  const productIds = order.orderItems.map(item => item.product.toString());
  if (socketId) req.io.to(socketId).emit("product-purchased", { userId: user._id.toString(), productIds });

  res.status(201).json(order);
});

// ---------------------- GET MY ORDERS ----------------------
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("orderItems.product", "name img price description")
    .sort({ createdAt: -1 });

  res.json(orders);
});

// ---------------------- UPDATE ORDER STATUS (ADMIN) ----------------------
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user");

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = req.body.status;
    await order.save();

    const notif = await Notification.create({
      user: order.user._id,
      title: "Order Status Updated",
      message: `Your order is now: ${req.body.status}`,
      type: "order",
    });

    const socketId = req.onlineUsers?.get(order.user._id.toString());
    if (socketId) req.io.to(socketId).emit("new-notification", notif);

    res.json({ message: "Order status updated & notification sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Check if user purchased a product
export const checkProductPurchased = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  console.log("Checking purchase for user:", userId, "product:", productId);

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ purchased: false, message: "Invalid product ID" });
  }

  const productObjectId = new mongoose.Types.ObjectId(productId);

  // Find any order containing the product that is either paid or completed
  const order = await Order.findOne({
    user: userId,
    $or: [
      { status: "completed" },
      { isPaid: true }
    ],
    "orderItems.product": productObjectId,
  });

  console.log("Found order:", !!order, order ? order._id : null);

  res.status(200).json({ purchased: !!order });
});












