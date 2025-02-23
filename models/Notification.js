const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User,Employee", required: true }, // Admin/Employee
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User,Employee", required: true }, // Admin/Employee
    message: { type: String, required: true },
    status: { type: String, enum: ["Unread", "Read"], default: "Unread" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
