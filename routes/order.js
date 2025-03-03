const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const authenticateToken = require("../middleware/auth");

// Create Order
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const { products, totalPrice, address, paymentMethod } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Products are required" });
    }

    // Check product stock and update
    for (let item of products) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `Product ${product?.name || "Unknown"} is out of stock` });
      }
      product.stock -= item.quantity;
      await product.save();
    }

    // Create new order
    const newOrder = new Order({
      user: req.user.id,
      products,
      totalPrice,
      address,
      paymentMethod,
      status: "pending",
    });

    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get All Orders for a User
router.get("/user", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("products.product");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get Order by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("products.product");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;