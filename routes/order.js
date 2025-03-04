const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/authrole"); // Ensure admin access

// Create Order (User)
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

// Get All Orders (Admin)
router.get("/all", authenticateToken, authorizeRoles("admin" ,"employee"), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "firstName lastName email") // Show user info
      .populate("products.product", "name price");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get Orders for a Specific User
router.get("/user", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("products.product", "name price");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get Order by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "firstName lastName email")
      .populate("products.product", "name price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is owner or admin
    if (req.user.role !== "admin" && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Update Order Status (Admin)
router.put("/update/:id", authenticateToken, authorizeRoles("admin" ,"employee"), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Delete Order (Admin)
router.delete("/delete/:id", authenticateToken, authorizeRoles("admin","employee"), async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
