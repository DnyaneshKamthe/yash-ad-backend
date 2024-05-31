const mongoose = require('mongoose');
const Employee = require("./employee")

const advertisementSchema = new mongoose.Schema({
  adName: {
    type: String,
    required: true,
  },
  adType: {
    type: String,
  },
  adImage: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  adCompanyName: {
    type: String,
  },
  adSize: {
    type: String,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Advertisement', advertisementSchema);