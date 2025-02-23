const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // ✅ Ensure Employee model is used for reference
      required: true,
    },
    priority: { type: String, enum: ["Low", "Medium", "High"], required: true },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

//  Ensure tasks automatically populate assigned employee details
taskSchema.pre(/^find/, function (next) {
  this.populate("assignedTo", "name employeeId"); // Fetch name & employeeId
  next();
});

module.exports = mongoose.model("Task", taskSchema);
