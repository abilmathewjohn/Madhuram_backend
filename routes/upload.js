const express = require('express');
const upload = require('../middleware/multer');
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/authrole');

const router = express.Router();

// Upload image (Admin or Employee)
router.post('/', authenticateToken, authorizeRoles('admin', 'employee'), upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    res.status(201).json({ message: 'Image uploaded successfully', imagePath: req.file.path });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
