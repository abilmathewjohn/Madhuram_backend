const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  type: { type: String, enum: ["banner", "offer", "product", "order", "employee", "profile"], required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, required: true }, // Can be either User or Employee
  userType: { type: String, enum: ["User", "Employee"], required: true }, // To differentiate between User and Employee
}, { timestamps: true });

module.exports = mongoose.model("Image", imageSchema);