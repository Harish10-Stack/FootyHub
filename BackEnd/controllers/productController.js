import Product from "../models/Product.js";

// @desc Get all products
// @route GET /api/products
// @access Public
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single product
// @route GET /api/products/:id
// @access Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) res.json(product);
    else res.status(404).json({ message: "Product not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create a new product
// @route POST /api/products
// @access Private/Admin
export const createProduct = async (req, res) => {
  const { name, description, price, img, category, stock } = req.body;
  const imagePath = req.file ? `/uploads/${category}/${req.file.filename}` : img;
  try {
    const product = new Product({ name, description, price, img: imagePath, category, stock });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Update product (partial updates allowed)
// @route PUT /api/products/:id
// @access Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Handle image upload
    if (req.file) {
      product.img = `/uploads/${req.body.category}/${req.file.filename}`;
    }

    // Only update the fields provided in req.body
    Object.keys(req.body).forEach((key) => {
      product[key] = req.body[key];
    });

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Delete product
// @route DELETE /api/products/:id
// @access Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

