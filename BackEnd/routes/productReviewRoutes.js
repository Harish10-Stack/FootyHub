import express from "express";
import {
  createReview,
  getProductReviews,
  deleteReview,
  getAllReviews,
} from "../controllers/productReviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Get all reviews (for admins)
router.get("/", protect, admin, getAllReviews);

// Get all reviews for a product
router.get("/product/:productId", getProductReviews);

// Create a review (user must be logged in)
router.post("/product/:productId", protect, createReview);

// Delete a review (user must be logged in and own the review)
router.delete("/:reviewId", protect, deleteReview);

export default router;












