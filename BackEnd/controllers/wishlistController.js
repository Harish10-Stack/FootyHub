import asyncHandler from "express-async-handler";
import Wishlist from "../models/wishlist.js";
import Product from "../models/product.js";

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products.product");
  // Filter out products that are null (e.g., deleted products) and return as array of { product }
  res.json(wishlist?.products.filter(p => p.product).map(p => ({ product: p.product })) || []);
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  const exists = wishlist.products.some(p => p.product.toString() === productId);
  if (exists) {
    res.status(400);
    throw new Error("Product already in wishlist");
  }

  wishlist.products.push({ product: productId });
  await wishlist.save();

  const populatedWishlist = await wishlist.populate("products.product");
  res.json(populatedWishlist.products.filter(p => p.product).map(p => ({ product: p.product })));
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    res.status(404);
    throw new Error("Wishlist not found");
  }

  wishlist.products = wishlist.products.filter(p => p.product.toString() !== productId);
  await wishlist.save();

  const populatedWishlist = await wishlist.populate("products.product");
  const filteredProducts = populatedWishlist.products.filter(p => p.product).map(p => ({ product: p.product }));
  res.json(filteredProducts);
});

