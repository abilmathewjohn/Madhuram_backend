const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(item => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(201).json({ message: 'Product added to cart', cart });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Get user cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) return res.status(404).json({ message: 'Cart is empty' });

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Update cart item quantity
router.put('/update/:productId', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(item => item.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: 'Product not in cart' });

    item.quantity = quantity;
    await cart.save();

    res.json({ message: 'Cart updated', cart });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Remove item from cart
router.delete('/remove/:productId', authenticateToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
    await cart.save();

    res.json({ message: 'Product removed from cart', cart });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Clear cart
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.id });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
