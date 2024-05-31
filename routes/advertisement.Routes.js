const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const AdvertisementController = require('../controllers/advertisement');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true,
// });

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Route to add advertisements
// router.post('/addAdvertisements', upload.single('adImage'), async (req, res) => {
//   try {
    
//     console.log(req.file)
//     const {adImage} = req.file;
//     console.log("ad image", adImage.buffer)
//     if (!req.file) {
//       return res.status(400).json({ message: 'No image uploaded' });
//     }

//     // Upload the image to Cloudinary
//     // const uploadResult = await cloudinary.uploader.upload(req.file.path, {
//     //   folder: 'uploads',
//     //   timeout: 7000,
//     // });

//     // // Call AdvertisementController function
//     // const advertisementData = await AdvertisementController.postAdvertisement({
//     //   ...req.body, // Include other advertisement data from request body
//     //   imageUrl: uploadResult.secure_url, // Add uploaded image URL
//     // });

//     const advertisementData = await cloudinary(adImage.buffer);

//     // Send success response
//     res.status(201).json(advertisementData);

//     // Clean up the local file after uploading to Cloudinary
//     fs.unlinkSync(req.file.path);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error uploading image or creating advertisement' });
//   }
// });

router.post('/addAdvertisements', upload.single('adImage'), AdvertisementController.postAdvertisement);

// Additional route to upload an image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Upload the image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: 'uploads',
      timeout: 7000,
    });

    // Send success response
    res.json({
      message: 'Image uploaded successfully!',
      url: uploadResult.secure_url,
    });

    // Clean up the local file after uploading to Cloudinary
    fs.unlinkSync(req.file.path);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

// Route to get all advertisements
router.get('/getAllAdvertisements', AdvertisementController.getAllAdvertisements);

module.exports = router;
