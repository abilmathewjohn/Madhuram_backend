const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/authrole");
const Notification = require("../models/Notification");
const Employee = require("../models/Employee");

//  Send Notification
router.post("/send", authenticateToken, async (req, res) => {
  try {
    const { message, recipientType, employeeId } = req.body;

    if (!message || !recipientType) {
      return res.status(400).json({ message: "Message and recipientType are required" });
    }

    let notifications = [];

    if (recipientType === "all") {
      const employees = await Employee.find();
      notifications = employees.map((employee) => ({
        sender: req.user.id,
        senderModel: req.user.role === "admin" ? "User" : "Employee",
        receiver: employee._id,
        receiverModel: "Employee",
        message,
      }));
    } else if (recipientType === "employee" && employeeId) {
      const employee = await Employee.findById(employeeId);
      if (!employee) return res.status(404).json({ message: "Employee not found" });

      notifications.push({
        sender: req.user.id,
        senderModel: req.user.role === "admin" ? "User" : "Employee",
        receiver: employee._id,
        receiverModel: "Employee",
        message,
      });
    } else {
      return res.status(400).json({ message: "Invalid recipientType or missing employeeId" });
    }

    await Notification.insertMany(notifications);
    res.status(201).json({ message: "Notification(s) sent successfully" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get All Notifications (Admin sees all, Employees see theirs)
router.get("/all", authenticateToken, async (req, res) => {
  try {
    let query = { receiver: req.user.id };

    if (req.user.role === "admin") {
      query = {}; // Admin sees all notifications
    }

    const notifications = await Notification.find(query)
      .populate("sender", "name")
      .populate("receiver", "name")
      .sort({ createdAt: -1 });

    await Notification.updateMany(query, { status: "Read" });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete Notification (Admin Only)
router.delete("/:id", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
