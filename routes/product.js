const express = require('express');
const Product = require('../models/Product');
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/authrole');
const upload = require('../middleware/multer');

const router = express.Router();

// Create a new product (Admin only)
router.post(
  '/create',
  authenticateToken,
  authorizeRoles('admin'),
  upload.single('image'),
  async (req, res) => {
    try {
      const { name, price, category, description, stock } = req.body;
      const image = req.file ? req.file.path : ''; // Store image path

      const newProduct = new Product({
        name,
        price,
        category,
        description,
        stock: stock || 0, // Default stock to 0 if not provided
        image
      });

      await newProduct.save();
      res.status(201).json({ message: 'Product created successfully', product: newProduct });
    } catch (err) {
      res.status(500).json({ message: 'Server Error', error: err.message });
    }
  }
);

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});


// Get a single product by ID
router.get("/:id", async (req, res) => {
  try {
      const product = await Product.findById(req.params.id);
      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
  } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
  }
});


// Update product (Admin only)
router.put(
  '/update/:id',
  authenticateToken,
  authorizeRoles('admin'),
  upload.single('image'),
  async (req, res) => {
    try {
      const { name, price, category, description, stock } = req.body;
      const image = req.file ? req.file.path : undefined;

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          name,
          price,
          category,
          description,
          stock,
          ...(image && { image }) // Only update image if a new one is uploaded
        },
        { new: true }
      );

      if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });

      res.json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (err) {
      res.status(500).json({ message: 'Server Error', error: err.message });
    }
  }
);

// Delete product (Admin only)
router.delete('/delete/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
