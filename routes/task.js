const express = require('express');
const Task = require('../models/Task');
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/authrole');

const router = express.Router();

// Create a task (Admin only)
router.post('/create', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate } = req.body;

    const newTask = new Task({
      title,
      description,
      assignedTo,
      dueDate,
      status: 'Pending'
    });

    await newTask.save();
    res.status(201).json({ message: 'Task created successfully', task: newTask });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Get all tasks (Admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Get tasks assigned to logged-in employee
router.get('/my-tasks', authenticateToken, authorizeRoles('employee'), async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Update task status (Employee)
router.put('/update/:id', authenticateToken, authorizeRoles('employee'), async (req, res) => {
  try {
    const { status } = req.body;
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, assignedTo: req.user.id },
      { status },
      { new: true }
    );

    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });

    res.json({ message: 'Task updated successfully', task: updatedTask });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Delete task (Admin only)
router.delete('/delete/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: 'Task not found' });

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
