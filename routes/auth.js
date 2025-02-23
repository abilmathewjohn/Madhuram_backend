const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, profileImage, address, location, additionalInfo } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user (password is auto-hashed in User model)
    const newUser = new User({
      firstName,
      lastName,
      email: email.trim().toLowerCase(),
      phone,
      password,
      role,
      profileImage,
      address,
      location,
      additionalInfo
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare hashed password using User model method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
