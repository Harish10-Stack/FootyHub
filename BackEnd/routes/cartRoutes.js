import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

// FIX: remove duplicate "/cart"
router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.put("/update/:productId", protect, updateCart);
router.delete("/remove/:productId", protect, removeFromCart);
router.delete("/clear", protect, clearCart);

export default router;




