const express = require('express');
const mongoose = require('mongoose');
const Advertisement = require('../models/advertisement'); 
const Employee = require('../models/employee');

// Create a new advertisement
const postAdvertisement = async (req, res) => {
    try {
        const { adName, adType,  adCompanyName, adSize } = req.body;
        console.log(req.body, req.user, req.file)
        const adImage = req.file ? `/uploads/${req.file.filename}` : null; // Construct the image URL 
        const advertisement = new Advertisement({
            adName,
            adType,
            adImage,
            adCompanyName,
            adSize,
            createdBy: req.user._id,
        });

        await advertisement.save();
        res.status(201).json({
            status: "success",
            message: "Advertisement created successfully",
            data: advertisement,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "error",
            message: `Failed to create advertisement: ${error.message}`,
        });
    }
};


// Get all advertisements
const getAllAdvertisements = async (req, res) => {
    console.log("get all ads");
    try {
      let advertisements;
  
      if (req.user.employeeRole === 'Admin') {
        advertisements = await Advertisement.find().populate('createdBy', "employeeName");
      } else if (req.user.employeeRole === 'User') {
        advertisements = await Advertisement.find({ createdBy: req.user._id }).populate('createdBy', "employeeName");
      } else {
        return res.status(403).json({ message: "Unauthorized access" });
      }
  
      console.log(advertisements, "filtered data");
      res.status(200).json(advertisements);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  

// Get an advertisement by ID
const getAdvertisementById =  async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Advertisement ID' });
        }

        const advertisement = await Advertisement.findById(id).populate('createBy', 'name');
        if (!advertisement) {
            return res.status(404).json({ message: 'Advertisement not found' });
        }

        res.status(200).json(advertisement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Update an advertisement by ID
const updateAdvertisementById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Advertisement ID' });
        }

        const advertisement = await Advertisement.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!advertisement) {
            return res.status(404).json({ message: 'Advertisement not found' });
        }

        res.status(200).json(advertisement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Delete an advertisement by ID
const deleteAdvertisement =  async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Advertisement ID' });
        }

        const advertisement = await Advertisement.findByIdAndDelete(id);
        if (!advertisement) {
            return res.status(404).json({ message: 'Advertisement not found' });
        }

        res.status(200).json({ message: 'Advertisement deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {postAdvertisement, getAllAdvertisements, getAdvertisementById, updateAdvertisementById, deleteAdvertisement };
