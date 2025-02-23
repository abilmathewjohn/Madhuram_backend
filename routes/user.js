const express = require('express');
const bcrypt = require('bcrypt');
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/authrole');
const User = require('../models/User');

const router = express.Router();

// Get all users (Admin only)
router.get('/all', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Delete user (Admin only)
router.delete('/delete/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Update user profile (Optional)
router.put('/profile/update', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, address, additionalInfo } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone, address, additionalInfo },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
