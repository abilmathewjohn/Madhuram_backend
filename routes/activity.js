const express = require("express");
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/authrole");
const ActivityLog = require("../models/ActivityLog");

const router = express.Router();

// Get all activity logs (Admin only)
router.get("/", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const logs = await ActivityLog.find().populate("user", "name email role").sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
