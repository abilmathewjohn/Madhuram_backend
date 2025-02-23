const express = require("express");
const Task = require("../models/Task");
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/authrole");
const logActivity = require("../middleware/logActivity");
const Employee = require("../models/Employee");
const User = require("../models/User");

const router = express.Router();

// Create a new task (Admin only)
router.post(
  "/create",
  authenticateToken,
  authorizeRoles("admin"),
  logActivity,
  async (req, res) => {
    try {
      const { title, description, assignedTo, priority, deadline } = req.body;

      if (!title || !description || !assignedTo || !priority || !deadline) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if assigned employee exists
      const employeeExists = await Employee.findById(assignedTo);
      if (!employeeExists) {
        return res.status(404).json({ message: "Assigned employee not found" });
      }

      const newTask = new Task({
        title,
        description,
        assignedTo,
        priority,
        deadline,
        createdBy: req.user.id,
        status: "Pending",
      });

      await newTask.save();
      res.status(201).json({ message: "Task created successfully", task: newTask });
    } catch (err) {
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }
);

// Get all tasks (Admin only)
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  logActivity,
  async (req, res) => {
    try {
      const tasks = await Task.find()
        .populate("assignedTo", "name employeeId") 
        .populate("createdBy", "name");

      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }
);

// Get employee's assigned tasks
router.get(
  "/my-tasks",
  authenticateToken,
  authorizeRoles("employee"),
  logActivity,
  async (req, res) => {
    try {
      const tasks = await Task.find({ assignedTo: req.user.id });
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }
);

// Update task status (Employee only)
router.put(
  "/update/:id",
  authenticateToken,
  authorizeRoles("employee"),
  logActivity,
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!["Pending", "In Progress", "Completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const existingTask = await Task.findById(req.params.id);
      if (!existingTask) return res.status(404).json({ message: "Task not found" });

      // Prevent employees from updating completed tasks
      if (existingTask.status === "Completed") {
        return res.status(400).json({ message: "Completed tasks cannot be updated" });
      }

      // Ensure employee can only update their assigned tasks
      if (existingTask.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized to update this task" });
      }

      existingTask.status = status;
      await existingTask.save();

      res.json({ message: "Task updated successfully", task: existingTask });
    } catch (err) {
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }
);

// Admin can update any task
router.put(
  "/admin-update/:id",
  authenticateToken,
  authorizeRoles("admin"),
  logActivity,
  async (req, res) => {
    try {
      const { title, description, assignedTo, priority, deadline, status } = req.body;

      // Validate assigned employee
      if (assignedTo) {
        const employeeExists = await Employee.findById(assignedTo);
        if (!employeeExists) {
          return res.status(404).json({ message: "Assigned employee not found" });
        }
      }

      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        { title, description, assignedTo, priority, deadline, status },
        { new: true }
      );

      if (!updatedTask) return res.status(404).json({ message: "Task not found" });

      res.json({ message: "Task updated successfully", task: updatedTask });
    } catch (err) {
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }
);

// Delete task (Admin only)
router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRoles("admin"),
  logActivity,
  async (req, res) => {
    try {
      const deletedTask = await Task.findByIdAndDelete(req.params.id);
      if (!deletedTask) return res.status(404).json({ message: "Task not found" });

      res.json({ message: "Task deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }
);

module.exports = router;
