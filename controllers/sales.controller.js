const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises; // Import the fs.promises module for file system operations
const Customers = require("../models/customer");
const Employees = require("../models/employee");
const nodemailer = require("nodemailer"); // npm install nodemailer
const checkAuth = require("../middleware/checkAuth");
const mongoose = require("mongoose");

const addCustomer = async (req, res) => {
  try {
    const {
      clientName,
      referredBy,
      email,
      number,
      clientType,
      requirement,
      source,
      sourceurl,
      followUpDate,
      quotation 
    } = req.body;
    console.log("body data",req.body);

    if (!clientName) {
      return res.status(400).json({ error: 'Client Name is required'});
    }
     
    const newCustomer = new Customers({
      clientName,
      referredBy,
      email,
      number,
      clientType,
      requirement,
      source,
      sourceurl,
      followUpDate,
      quotation ,
      latestFollowUpDate:followUpDate,
      createBy: req.user._id,
    });
    await newCustomer.save();
    res.status(200).json({ status: 200, message: "Customer added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message:error.message });
  }
};

const addCustomer = async (req, res) => {
  try {
    const {
      clientName,
      referredBy,
      email,
      number,
      clientType,
      requirement,
      source,
      sourceurl,
      followUpDate,
      quotation 
    } = req.body;

    if (!clientName) {
      return res.status(400).json({ error: 'Client Name is required'});
    }
     
    const newCustomer = new Customers({
      clientName,
      referredBy,
      email,
      number,
      clientType,
      requirement,
      source,
      sourceurl,
      followUpDate,
      quotation ,
      latestFollowUpDate:followUpDate,
      createBy: req.user._id,
    });
    await newCustomer.save();
    res.status(200).json({ status: 200, message: "Customer added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message:error.message });
  }
};




const setCustomerAsLost = async (req, res) => {
  try {
    const customerId = req.params.customerId;

    const customerAlreadySetToLast = await Customers.findOne({ _id: customerId , status: "lost" });
    if (customerAlreadySetToLast) {
      return res.status(409).json({ message: 'Customer already set to lost' });
    }
    const customer = await Customers.findOneAndUpdate({ _id: customerId }, { status: "lost" });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(200).json({ status: 200, message: "Customer status updated to lost" })
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message:error.message });
  }
};

const get_all_customers = async (req, res) => {
  const userId = req.user._id;
  const todaysDate = new Date().toISOString().split('T')[0];
  const currentDate = new Date();

  // Set the time to 5:00 pm IST
  currentDate.setUTCHours(11, 30, 0, 0);

  const todaysDateUpTo5PMIST = currentDate.toISOString().split('T')[0];
  const tomorrowsDate = new Date();
  tomorrowsDate.setDate(tomorrowsDate.getDate() + 1);
  
  const formattedTomorrowsDate = tomorrowsDate.toISOString().split('T')[0];

  const user = await Employees.findOne({ _id: userId });

  let allCustomers, totalLeads;
  try {
    if (req.user.employeeRole === "Admin") {
      // allCustomers = await Customers.find();
      allCustomers = await Customers.aggregate([
        {
          $match: {
            $or: [
              { status: "success" },
              { status: "workOrder" },
            ],
          },
        },
        {
          $lookup: {
            from: "employees", // The name of the referenced collection
            localField: "createBy", // The field from the input documents
            foreignField: "_id", // The field from the referenced documents
            as: "createdByUserDetails", // The name of the new array field
          },
        },
        {
          $unwind: {
            path: "$createdByUserDetails",
            preserveNullAndEmptyArrays: true, // Preserve unmatched documents
          },
        },
        {
          $project: {
            _id: 1,
            clientName: 1,
            email: 1,
            number: 1,
            clientType:1,
            referredBy:1,
            source:1,
            sourceurl:1,
            followUpDate: 1,
            latestFollowUpDate :1,
            requirement: 1,
            quotation: 1,
            additionalFollowups: 1,
            status: 1,
            createdAt:1,
            createBy: 1,
            createByName: {
              $ifNull: ["$createdByUserDetails.employeeName", "NA"],
            },
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      
      const leads = await Customers.find({ status: "onboarding" });
      const createdByIds = leads.map(lead => lead.createBy);
      const employees = await Employees.find({ _id: { $in: createdByIds } });
      const employeeMap = employees.reduce((map, employee) => {
        map[employee._id.toString()] = employee;
        return map;
      }, {});
      
      totalLeads = leads.map(lead => ({
        lead,
        createByName: employeeMap[lead.createBy.toString()].employeeName,
      }));
      // totalLeads = await Customers.find({ status: "onboarding" });
      const leads2 = await Customers.find({ status: "lost" });
      const createdByIds2 = leads2.map(lead => lead.createBy);
      const employees2 = await Employees.find({ _id: { $in: createdByIds2 } });
      const employeeMap2 = employees2.reduce((map, employee) => {
        map[employee._id.toString()] = employee;
        return map;
      }, {});
      
      lostLeads = leads2.map(lead => ({
        lead,
        createByName: employeeMap2[lead.createBy.toString()].employeeName,
      }));
      // lostLeads = await Customers.find({ status: "lost" });
      const leads3 = await Customers.find({ latestFollowUpDate: { $eq: todaysDate } });
      const createdByIds3 = leads3.map(lead => lead.createBy);
      const employees3 = await Employees.find({ _id: { $in: createdByIds3 } });
      const employeeMap3 = employees3.reduce((map, employee) => {
        map[employee._id.toString()] = employee;
        return map;
      }, {});
      
      todaysFollowUps = leads3.map(lead => ({
        lead,
        createByName: employeeMap3[lead.createBy.toString()].employeeName,
      }));
      // todaysFollowUps = await Customers.find({ latestFollowUpDate: { $eq: todaysDate } });
      const leads4 = await Customers.find({
        $and: [
          { latestFollowUpDate: { $eq: formattedTomorrowsDate } },
          { status: "onboarding" },
        ],
      });
      const createdByIds4 = leads4.map(lead => lead.createBy);
      const employees4 = await Employees.find({ _id: { $in: createdByIds4 } });
      const employeeMap4 = employees4.reduce((map, employee) => {
        map[employee._id.toString()] = employee;
        return map;
      }, {});
      
      nextDaysFollowUps = leads4.map(lead => ({
        lead,
        createByName: employeeMap4[lead.createBy.toString()].employeeName,
      }));
      // nextDaysFollowUps = await Customers.find({
      //   $and: [
      //     { latestFollowUpDate: { $eq: formattedTomorrowsDate } },
      //     { status: "onboarding" }
      //   ]
      // });
      const leads5 = await Customers.find({ latestFollowUpDate: { $gt: formattedTomorrowsDate } });
      const createdByIds5 = leads5.map(lead => lead.createBy);
      const employees5 = await Employees.find({ _id: { $in: createdByIds5 } });
      const employeeMap5 = employees5.reduce((map, employee) => {
        map[employee._id.toString()] = employee;
        return map;
      }, {});
      
      upcomingFollowUps = leads5.map(lead => ({
        lead,
        createByName: employeeMap5[lead.createBy.toString()].employeeName,
      }));
      // upcomingFollowUps = await Customers.find({ latestFollowUpDate: { $gt: formattedTomorrowsDate } });
      const leads6 = await Customers.find({
        $and: [
              { latestFollowUpDate: { $lt: todaysDate } },
              { status: "onboarding" },
            ],
      });
      const createdByIds6 = leads6.map(lead => lead.createBy);
      const employees6 = await Employees.find({ _id: { $in: createdByIds6 } });
      const employeeMap6 = employees6.reduce((map, employee) => {
        map[employee._id.toString()] = employee;
        return map;
      }, {});
      
      missedFollowUps = leads6.map(lead => ({
        lead,
        createByName: employeeMap6[lead.createBy.toString()].employeeName,
      }));
      // missedFollowUps = await Customers.find({
      //   $and: [
      //     { latestFollowUpDate: { $lt: todaysDate } },
      //     { status: "onboarding" },
      //   ],
      // });

      activeWorkOrders = await Customers.find({ status: "workOrder" });

    }  else {
      allCustomers = await Customers.find({ createBy: userId, status: "workOrder" || "success" }).sort({ createdAt: -1 });
      const leads9 = await Customers.find({ createBy: userId, status: "onboarding" });
      totalLeads = leads9.map(lead => ({
        lead,
      }));
      const leads10 = await Customers.find({ createBy: userId, status: "lost" });
      lostLeads = leads10.map(lead => ({
        lead,
      }));
      const leads11 = await Customers.find({ createBy: userId, latestFollowUpDate: { $eq: todaysDate }, status: "onboarding" });
      todaysFollowUps = leads11.map(lead => ({
        lead,
      }));
      const leads12 = await Customers.find({ 
        $and: [
          { createBy: userId},
          { latestFollowUpDate: { $gt: todaysDate } },
          { status: "onboarding" },
        ],
      });
      nextDaysFollowUps = leads12.map(lead => ({
        lead,
      }));
      const leads13 = await Customers.find({ createBy: userId, latestFollowUpDate: { $gt: formattedTomorrowsDate } });
      upcomingFollowUps = leads13.map(lead => ({
        lead,
      }));
      const leads14 = await Customers.find({
        $and: [
          { createBy: userId},
          { latestFollowUpDate: { $lt: todaysDate } },
          { status: "onboarding" },
        ],
      });
      missedFollowUps = leads14.map(lead => ({
        lead,
      }));
      activeWorkOrders = await Customers.find({ createBy: userId, status: "workOrder" });

    }
    // Fetch all customers from the database
    
    const leads7 = await Customers.find({ _id: { $in: user.assignedLeads } });
    const createdByIds7 = leads7.map(lead => lead.createBy);
    const employees7 = await Employees.find({ _id: { $in: createdByIds7 } });
    const employeeMap7 = employees7.reduce((map, employee) => {
      map[employee._id.toString()] = employee;
      return map;
    }, {});
    
    const assignedLeads = leads7.map(lead => ({
      lead,
      createByName: employeeMap7[lead.createBy.toString()].employeeName,
    }));
    // const assignedLeads = await Customers.find({ _id: { $in: user.assignedLeads } });
    const leads8 = await Customers.find({ _id: { $in: user.transferredLeads } });
    const createdByIds8 = leads8.map(lead => lead.createBy);
    const employees8 = await Employees.find({ _id: { $in: createdByIds8 } });
    const employeeMap8 = employees8.reduce((map, employee) => {
      map[employee._id.toString()] = employee;
      return map;
    }, {});
    
    const transferredLeads = leads8.map(lead => ({
      lead,
      createByName: employeeMap8[lead.createBy.toString()].employeeName,
    }));
    // const transferredLeads = await Customers.find({ _id: { $in: user.transferredLeads } });

    res.status(200).json({
                          customers: allCustomers, totalLeads: totalLeads, lostLeads: lostLeads, assignedLeads: assignedLeads, transferredLeads: transferredLeads,
                          todaysFollowUps: todaysFollowUps, nextDaysFollowUps: nextDaysFollowUps, upcomingFollowUps: upcomingFollowUps,
                          missedFollowUps: missedFollowUps, activeWorkOrders: activeWorkOrders,
                        });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message:error.message });
  }
};
// get todays leads
const get_todays_leads = async (req, res) => {
  console.log(req.user);
  const userId = req.user._id;
  const todayDate = new Date().toISOString().split('T')[0]; // Get today's date in "YYYY-MM-DD" format
  try {
    if (req.user.employeeRole === "Admin") {
      todaysLeads = await Customers.aggregate([
        {
          $match: {
            // followUpDate: {
            //   $gte: todayStart.toISOString(),
            //   $lt: todayEnd.toISOString(),
            // },
            followUpDate: todayDate,
          },
        },
        {
          $lookup: {
            from: "employees", // The name of the referenced collection
            localField: "createBy", // The field from the input documents
            foreignField: "_id", // The field from the referenced documents
            as: "createdByUserDetails", // The name of the new array field
          },
        },
        {
          $unwind: {
            path: "$createdByUserDetails",
            preserveNullAndEmptyArrays: true, // Preserve unmatched documents
          },
        },
        {
          $project: {
            _id: 1,
            clientName: 1,
            email: 1,
            number: 1,
            address: 1,
            city:1,
            followUpDate: 1,
            latestFollowUpDate:1,
            requirement: 1,
            remarks: 1,
            clientlevel:1,
            additionalFollowups: 1,
            electricityBill: 1,
            pancard: 1,
            adharcard: 1,
            textRecipe: 1,
            status: 1,
            createdAt :1,
            createBy: 1,
            createByName: {
              $ifNull: ["$createdByUserDetails.employeeName", "NA"],
            },
          },
        },
      ]);
    } else {
      todaysLeads = await Customers.find({
        createBy: userId,
        // followUpDate: {
        //   $gte: todayStart.toISOString(),
        //   $lt: todayEnd.toISOString(),
        // },
        followUpDate: todayDate,
      });
    }
    // Fetch all customers from the database
    console.log(todaysLeads)
    res.status(200).json({ todaysLeads: todaysLeads });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message:error.message });
  }
};

// const updateCustomerDetails = async (req, res) => {
//   const customerId = req.params.customerId;
//   const updatedDetails = req.body;

//   try {
//     // Parse the followUps string back into a JavaScript array
//     if (updatedDetails.followUps && typeof updatedDetails.followUps === 'string') {
//       updatedDetails.followUps = JSON.parse(updatedDetails.followUps);
//     }

//     // Check if additionalFollowups are present in the request body
//     if (updatedDetails.followUps && updatedDetails.followUps.length > 0) {
//       const followUpsWithRemarks = updatedDetails.followUps
//         .filter(followUp => followUp.followUpDate && followUp.remarks)
//         .map(followUp => ({ followUpDate: followUp.followUpDate, remarks: followUp.remarks }));

//       try {
//         console.log("latestFollowUpDate :",updatedDetails.followUps);
//         const filter = { _id: customerId };
//         const update = { $set: { additionalFollowups: followUpsWithRemarks} };
//         const options = { new: true };

//         const updatedCustomer = await Customers.findOneAndUpdate(filter, update, options);

//         if (!updatedCustomer) {
//           return res.status(404).json({ message: 'Customer not found' });
//         }

//         return res.status(200).json({
//           status: 200,
//           message: 'Customer details updated',
//           customer: updatedCustomer
//         });
//       } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: 'Internal Server Error - customer update' });
//       }
//     }

//     // If followUps are not present, update other fields without modifying additionalFollowups
//     const updatedCustomer = await Customers.findByIdAndUpdate(
//       customerId,
//       { $set: updatedDetails },
//       { new: true }
//     );

//     if (!updatedCustomer) {
//       return res.status(404).json({ message: 'Customer not found' });
//     }

//     res.status(200).json({ status: 200, message: 'Customer details updated', customer: updatedCustomer });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error - customer update' });
//   }
// };
const updateCustomerDetails = async (req, res) => {
  const customerId = req.params.customerId;
  const updatedDetails = req.body;
  console.log(updatedDetails, '&&&&')
  let latestFollowUpDate;

  try {
    // Parse the followUps string back into a JavaScript array
    if (updatedDetails.followUps && typeof updatedDetails.followUps === 'string') {
      updatedDetails.followUps = JSON.parse(updatedDetails.followUps);
    }

    // Check if followUps are present in the request body
    if (updatedDetails.followUps && updatedDetails.followUps.length > 0) {
      // Add latestFollowupDate to each object in the followUps array
      latestFollowUpDate = updatedDetails.followUps.slice(-1)[0].followUpDate;
      updatedDetails.followUps = updatedDetails.followUps.map(followUp => ({
        ...followUp,
        latestFollowUpDate,
      }));
      // console.log("latestFollowUpDate",latestFollowUpDate);
      // Filter and map the followUps to keep only those with followUpDate and remarks
      const followUpsWithRemarks = updatedDetails.followUps
        .filter(followUp => followUp.followUpDate && followUp.remarks)
        .map(followUp => ({ followUpDate: followUp.followUpDate, remarks: followUp.remarks }));

      try {
        const filter = { _id: customerId };
        const update = { $set: { additionalFollowups: followUpsWithRemarks,latestFollowUpDate:latestFollowUpDate } };
        const options = { new: true };

        const updatedCustomer = await Customers.findOneAndUpdate(filter, update, options);

        if (!updatedCustomer) {
          return res.status(404).json({ message: 'Customer not found' });
        }

        return res.status(200).json({
          status: 200,
          message: 'Customer details updated',
          customer: updatedCustomer
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message:error.message });
      }
    }

    // If followUps are not present, update other fields without modifying additionalFollowups
    const updatedCustomer = await Customers.findByIdAndUpdate(
      customerId,
      { $set: updatedDetails },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({ status: 200, message: 'Customer details updated', customer: updatedCustomer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message:error.message });
  }
};







const deleteCustomer = async (req, res) => {
  const customerId = req.body;
 try {
   const deleteCustomer = await  Customers.deleteOne({ _id: customerId.customerId });
   if(deleteCustomer){
    res.status(200).json({ message: 'Customer Deleted'});
   }
 } catch (error) {
  console.error(error);
    res.status(500).json({ error: "Internal Server Error- customer deletion" });
 }

}
const verify_user = async (req, res) => {
  const { role, userId } = req.body;
  try {
    const user = await User.findOne({ role, userId });
    if (user) {
      const otp = generateOTP();
      user.passwordResetOTP = otp;
      await user.save();
      // Send OTP to user's email
      await sendOTPEmail(user.userId, otp);
      res
        .status(200)
        .json({ message: "User verify successfully and Sent OTP via mail..." });
    } else {
      res.status(401).json({ message: "Invalid credentials." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const verify_otp = async (req, res) => {
  const { passwordResetOTP } = req.body; // Destructure the passwordResetOTP from req.body
  try {
    const user = await User.findOne({ passwordResetOTP: passwordResetOTP });

    if (user) {
      res.status(200).json({ message: "OTP verified successfully" });
    } else {
      res.status(401).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const submit_password_reset = async (req, res) => {
  const { userId, new_password } = req.body;

  try {
    // Check if userId and new_password are provided
    if (!userId || !new_password) {
      return res
        .status(400)
        .json({ message: "Missing userId or new_password." });
    }

    // Find the user by userId
    const user = await User.findOne({ userId });

    // Check if the user exists
    if (user) {
      // Update password and reset OTP
      user.password = new_password;
      user.passwordResetOTP = undefined;

      // Save changes to the database
      await user.save();

      // Respond with success message
      res.status(200).json({ message: "Password Reset Successfully." });
    } else {
      // If user is not found, respond with an error
      res.status(401).json({ message: "Invalid credentials." });
    }
  } catch (error) {
    // Handle unexpected errors
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

//send OTP via email
async function sendOTPEmail(userId, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.PASSWORD,
    to: userId,
    subject: "Password Reset OTP",
    text: `Your OTP for password reset is : ${otp}`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  addCustomer,
  get_all_customers,
  get_todays_leads,
  updateCustomerDetails,
  deleteCustomer,
  verify_user,
  verify_otp,
  submit_password_reset,
  setCustomerAsLost,
};
