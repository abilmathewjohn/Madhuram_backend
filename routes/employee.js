const express = require('express');
const Employee = require('../models/Employee');
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/authrole');
const multer = require('../middleware/multer');

const router = express.Router();

// Create a new employee (Admin only)
router.post(
  "/create",
  authenticateToken,
  authorizeRoles("admin"),
  multer.single("profileImage"),
  async (req, res) => {
    try {
      const {name,email,phone,password} = req.body;
      const profileImage = req.file ? req.file.path : "";

      const newEmployee = new Employee({
        name :name,
        email :email,
        phone :phone,
        password :password,
        profileImage,
      });

      await newEmployee.save();
      res.status(201).json({ message: "Employee created successfully", employee: newEmployee });
    } catch (err) {
      res.status(500).json({ message: "Server Error", error: err });
    }
  }
);

// Get all employees (Admin only)
router.get("/", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Get a single employee by ID (Admin)
router.get("/:id", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Update employee details (Admin)
router.put(
  "/update/:id",
  authenticateToken,
  authorizeRoles("admin"),
  multer.single("profileImage"),
  async (req, res) => {
    try {
      const { name, email, phone } = req.body;
      const profileImage = req.file ? req.file.path : undefined;

      const updatedEmployee = await Employee.findByIdAndUpdate(
        req.params.id,
        { name, email, phone, ...(profileImage && { profileImage }) },
        { new: true }
      );

      if (!updatedEmployee) return res.status(404).json({ message: "Employee not found" });

      res.json({ message: "Employee updated successfully", employee: updatedEmployee });
    } catch (err) {
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }
);

// Delete an employee (Admin)
router.delete("/delete/:id", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
    if (!deletedEmployee) return res.status(404).json({ message: "Employee not found" });

    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;