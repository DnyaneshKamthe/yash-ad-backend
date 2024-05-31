const mongoose = require("mongoose");
const Employee = require("./employee");

const followupSchema = new mongoose.Schema({
  followUpDate: String,
  remarks: String,
});

const customerSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true },
    referredBy: { type: String},
    email:  { type: String},
    number: { type: String},
    clientType:{
      type:String,
      enum: ["Project", "Freelance", "IT Staffing", "Non IT Staffing"],
    },
    requirement: { type: String},
    source: { type: String },
    sourceurl:{type: String},
    followUpDate: { type: String},
    latestFollowUpDate:  { type: String},
    quotation: { type: String},
    additionalFollowups: [followupSchema], // Array of followups
    transferred: {
      type: Boolean,
      default: false,
    },
    transferredTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee', // Reference to the User model for the head
    },
    status: {
      type: String,
      enum: ["onboarding", "success", "pending", "workOrder", "lost"],
      default: "onboarding",
    },
    createBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // Replace 'Employee' with the actual model name if different
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Customers", customerSchema);
