// controllers/productReviewController.js
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Review from "../models/productReviewModel.js";
import Product from "../models/Product.js";
import Notification from "../models/Notification.js";
import Order from "../models/order.js";
import User from "../models/User.js";

// Helper to check if user purchased the product
const hasPurchased = async (userId, productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) return false;

  const order = await Order.findOne({
    user: userId,
    $or: [
      { isPaid: true },
      { status: "completed" },
    ],
    "orderItems.product": new mongoose.Types.ObjectId(productId),
  });

  return !!order;
};

// ------------------------
// Create a review
// ------------------------
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const userId = req.user._id;
  const productId = req.params.productId;

  if (!productId || !rating || !comment) {
    res.status(400);
    throw new Error("All fields are required");
  }

  // ✅ Check if user purchased the product
  const purchased = await hasPurchased(userId, productId);
  if (!purchased) {
    res.status(403);
    throw new Error("You can only review products you have purchased");
  }

  // Create review
  const review = await Review.create({ user: userId, product: productId, rating, comment });

  // Update product average rating using aggregation (more efficient)
  const avgRatingObj = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" } } },
  ]);
  const avgRating = avgRatingObj[0]?.avgRating || 0;
  await Product.findByIdAndUpdate(productId, { rating: avgRating });

  // Populate user for frontend
  const populatedReview = await Review.findById(review._id).populate("user", "name");

  // Emit review to frontend via Socket.IO
  if (req.io) {
    req.io.emit("new-review", { review: populatedReview });
  }

  // Optional: create a notification for all admins
  const admins = await User.find({ isAdmin: true });
  const adminNotifications = admins.map(admin => ({
    title: "New Review",
    message: `New review on product ${productId}: "${comment}"`,
    user: admin._id,
  }));
  await Notification.insertMany(adminNotifications);

  // Emit to online admins
  admins.forEach((admin) => {
    const socketId = req.onlineUsers.get(admin._id.toString());
    if (socketId) {
      const adminNotification = adminNotifications.find(
        (n) => n.user.toString() === admin._id.toString()
      );
      req.io.to(socketId).emit("new-notification", adminNotification);
    }
  });

  res.status(201).json({ review: populatedReview });
});

// ------------------------
// Get reviews for a product
// ------------------------
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json([]); // return empty array instead of error
  }

  const reviews = await Review.find({ product: productId })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json(Array.isArray(reviews) ? reviews : []);
});

// ------------------------
// Get all reviews (for admins)
// ------------------------
export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({})
    .populate("user", "name email")
    .populate("product", "name")
    .sort({ createdAt: -1 });

  res.status(200).json(Array.isArray(reviews) ? reviews : []);
});

// ------------------------
// Delete a review
// ------------------------
export const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    res.status(400);
    throw new Error("Invalid review ID");
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  // Check if the user owns this review
  if (review.user.toString() !== userId.toString()) {
    res.status(403);
    throw new Error("You can only delete your own reviews");
  }

  await Review.findByIdAndDelete(reviewId);

  // Update product average rating after deletion
  const avgRatingObj = await Review.aggregate([
    { $match: { product: review.product } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" } } },
  ]);
  const avgRating = avgRatingObj[0]?.avgRating || 0;
  await Product.findByIdAndUpdate(review.product, { rating: avgRating });

  res.status(200).json({ message: "Review deleted successfully" });
});















