const express = require("express");
const Notification = require("../models/Notification");
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/authrole");
const logActivity = require("../middleware/logActivity");

const router = express.Router();

// Send a notification (Admin & Employee)
router.post(
  "/send",
  authenticateToken,
  authorizeRoles("admin", "employee"),
  logActivity,
  async (req, res) => {
    try {
      const { receiver, message } = req.body;

      if (!receiver || !message) {
        return res.status(400).json({ message: "Receiver and message are required" });
      }

      const newNotification = new Notification({
        sender: req.user.id,
        receiver,
        message,
      });

      await newNotification.save();
      res.status(201).json({ message: "Notification sent successfully", notification: newNotification });
    } catch (err) {
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }
);

// Get notifications for logged-in user
router.get(
  "/my-notifications",
  authenticateToken,
  logActivity,
  async (req, res) => {
    try {
      const notifications = await Notification.find({ receiver: req.user.id })
        .populate("sender", "name")
        .sort({ createdAt: -1 });

      res.json(notifications);
    } catch (err) {
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }
);

// Mark notification as read
router.put(
  "/mark-read/:id",
  authenticateToken,
  logActivity,
  async (req, res) => {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, receiver: req.user.id },
        { status: "Read" },
        { new: true }
      );

      if (!notification) return res.status(404).json({ message: "Notification not found" });

      res.json({ message: "Notification marked as read", notification });
    } catch (err) {
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }
);

// Admin sends notification to a specific employee
router.post(
  "/send-to-employee",
  authenticateToken,
  authorizeRoles("admin"),
  logActivity,
  async (req, res) => {
    try {
      const { employeeId, message } = req.body;

      if (!employeeId || !message) {
        return res.status(400).json({ message: "Employee ID and message are required" });
      }

      const newNotification = new Notification({
        sender: req.user.id,
        receiver: employeeId,
        message,
      });

      await newNotification.save();
      res.status(201).json({ message: "Notification sent to employee", notification: newNotification });
    } catch (err) {
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }
);

module.exports = router;
