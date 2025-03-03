const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/authrole");

// Create Payment
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const { orderId, amount, paymentMethod, transactionId } = req.body;

    // Validate order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create payment
    const newPayment = new Payment({
      userId: req.user.id,
      orderId,
      amount,
      paymentMethod,
      transactionId,
      status: "Success", // Assuming payment is successful
    });

    await newPayment.save();

    // Update order status
    order.status = "processing";
    await order.save();

    res.status(201).json({ message: "Payment successful", payment: newPayment });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get Payment History for User
router.get("/user", authenticateToken, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id }).populate("orderId");
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;