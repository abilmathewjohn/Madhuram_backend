// routes/cart.js
const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const authenticateToken = require("../middleware/auth");

// Get cart
router.get("/", authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
    res.status(200).json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Add item to cart
router.post("/add", authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock available" });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find((item) => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(201).json({ message: "Product added to cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Update item quantity in cart
router.put("/update/:productId", authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === req.params.productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Remove item from cart
router.delete("/remove/:productId", authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get cart count
router.get("/count", authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    const count = cart ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;