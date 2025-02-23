const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/authrole');
const logActivity = require('../middleware/logActivity');

const router = express.Router();

// Create a new order (User)
router.post('/create', authenticateToken, logActivity, async (req, res) => {
  try {
    const { products, totalPrice, address, paymentMethod } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'Products are required' });
    }

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

// Get all orders (Admin only) with product images
router.get('/', authenticateToken, authorizeRoles('admin'), logActivity, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate({
        path: 'products.product',
        select: 'name price imageUrl'
      });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Get user orders with product images
router.get('/my-orders', authenticateToken, logActivity, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: 'products.product',
        select: 'name price imageUrl'
      });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Update order status (Admin)
router.put('/update/:id', authenticateToken, authorizeRoles('admin'), logActivity, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

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
router.delete('/delete/:id', authenticateToken, authorizeRoles('admin'), logActivity, async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: 'Order not found' });

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
