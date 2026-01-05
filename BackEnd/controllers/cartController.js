import asyncHandler from "express-async-handler";
import Cart from "../models/cart.js";
import Product from "../models/Product.js";

// Helper to populate items with product object safely
const populateCartItems = async (cart) => {
  if (!cart) return [];
  const populated = await cart.populate("items.product");
  return populated.items
    .filter(item => item.product) // Filter out items with deleted products
    .map(item => ({
      product: item.product,
      quantity: item.quantity || 1,
      size: item.size || ""
    }));
};

// Get user's cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  const items = await populateCartItems(cart);
  res.json(items);
});

// Add product to cart
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, size = "" } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existingIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId && item.size === size
  );

  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity, size });
  }

  await cart.save();
  const items = await populateCartItems(cart);
  res.json(items);
});

// Update quantity
export const updateCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity, size = "" } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId && item.size === size
  );

  if (itemIndex >= 0) {
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
  } else {
    res.status(404);
    throw new Error("Cart item not found");
  }

  const items = await populateCartItems(cart);
  res.json(items);
});

// Remove item
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { size = "" } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter(
    (item) => !(item.product.toString() === productId && item.size === size)
  );

  await cart.save();
  const items = await populateCartItems(cart);
  res.json(items);
});

// Clear cart
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.json([]);
});


