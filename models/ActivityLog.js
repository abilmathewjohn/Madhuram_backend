const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who performed the action
    role: { type: String, enum: ["admin", "employee", "user"], required: true }, // Role of the user
    action: { type: String, required: true }, // What action was performed
    details: { type: Object }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
