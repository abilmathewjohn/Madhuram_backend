const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["employee"], default: "employee" },
    profileImage: { type: String },
    isPasswordChanged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

employeeSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastEmployee = await mongoose.model("Employee").findOne().sort({ createdAt: -1 });

    let newId = 1;
    if (lastEmployee && lastEmployee.employeeId) {
      const lastId = parseInt(lastEmployee.employeeId.split("-")[1]);
      newId = lastId + 1;
    }

    this.employeeId = `MD-${newId.toString().padStart(3, "0")}`;
  }

  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

employeeSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Employee", employeeSchema);
