const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, refPath: "senderModel", required: true },
    senderModel: { type: String, enum: ["User", "Employee"], required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, refPath: "receiverModel", required: false },
    receiverModel: { type: String, enum: ["User", "Employee"], required: false },
    message: { type: String, required: true },
    status: { type: String, enum: ["Unread", "Read"], default: "Unread" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
