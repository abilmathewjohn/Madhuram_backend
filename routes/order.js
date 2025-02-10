const express = require('express');
const Order = require('../models/Order');
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/authrole');

const router = express.Router();

// Create a new order (User)
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { products, totalPrice, address, paymentMethod } = req.body;

    const newOrder = new Order({
      user: req.user.id,
      products,
      totalPrice,
      address,
      paymentMethod,
      status: 'pending'
    });

    await newOrder.save();
    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Get all orders (Admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Get user orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Update order status (Admin)
router.put('/update/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });

    res.json({ message: 'Order updated successfully', order: updatedOrder });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Delete order (Admin)
router.delete('/delete/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: 'Order not found' });

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
