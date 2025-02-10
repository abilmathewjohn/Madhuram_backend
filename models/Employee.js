const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true }, // Employee ID with custom format
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee'], default: 'employee' },
  profileImage: { type: String },
  isPasswordChanged: { type: Boolean, default: false } // Track if password is changed
}, { timestamps: true });

// Auto-generate Employee ID (MD-001, MD-002, etc.)
employeeSchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastEmployee = await mongoose.model('Employee').findOne().sort('-employeeId');
    
    let newId = 1;
    if (lastEmployee && lastEmployee.employeeId) {
      const lastId = parseInt(lastEmployee.employeeId.split('-')[1]); // Extract numeric part
      newId = lastId + 1;
    }

    this.employeeId = `MD-${newId.toString().padStart(3, '0')}`; // Format MD-001, MD-002, etc.
  }
  
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
employeeSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Employee', employeeSchema);
