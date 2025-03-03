const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, enum: ["Success", "Pending", "Failed"], default: "Pending" },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);