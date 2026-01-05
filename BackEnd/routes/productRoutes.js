import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import uploadProduct from "../middleware/uploadProduct.js";

const router = express.Router();

router.route("/")
  .get(getProducts)           // GET all products
  .post(protect, admin, uploadProduct.single('img'), createProduct); // POST new product

router.route("/:id")
  .get(getProductById)        // GET single product
  .put(protect, admin, uploadProduct.single('img'), updateProduct)  // UPDATE product
  .delete(protect, admin, deleteProduct); // DELETE product

export default router;

