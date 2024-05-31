const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeName: { type: String, required: true },
    email: { type: String, unique: true },
    employeeId: { type: String, required: true, unique: true },
    employeePassword: { type: String, required: true },
    employeeRole: {
      type: String,
      enum: [
        "Admin",
        "User",
      ],
      default: "User", // Set a default role if not provided
      required: true,
    },
    passwordResetOTP: { type: String }, // Add this field for storing the OTP
    transferredLeads: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customers",
    }],
    assignedLeads: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customers",
    }]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Employee", employeeSchema);
