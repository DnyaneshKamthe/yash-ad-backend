const express = require('express');
const { 
  setClientInfo, 
  saveDocuments, 
  setPlantDetails, 
  setLiasoningDetails,
  addCommercialDetails ,
  addPaymentDetails,
  get_all_work_orders,
  get_client_work_details
} = require('../controllers/setWorkOrderController');
const router = express.Router();
const multer = require('multer');
const path = require('path');


// for documents tab 

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the destination directory for uploaded files
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for each file
    const uniqueFilename = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);

    cb(null, uniqueFilename + extension);
  },
});
const upload = multer({ storage: storage });

router.post('/setClientInfo', setClientInfo);

router.post('/saveDocuments/:client_id', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'adharcard', maxCount: 1 },
  { name: 'pancard', maxCount: 1 },
  { name: 'electricitybill', maxCount: 1 },
  { name: 'taxreceipt', maxCount: 1 },
  { name: 'powerofattorney', maxCount: 1 },
  { name: 'annexure2', maxCount: 1 },
  { name: 'applicationform', maxCount: 1 }
]),saveDocuments);

// router.get('/getDocuments', upload.fields([
//   { name: 'photo', maxCount: 1 },
//   { name: 'adharcard', maxCount: 1 },
//   { name: 'pancard', maxCount: 1 },
//   { name: 'electricitybill', maxCount: 1 },
//   { name: 'taxreceipt', maxCount: 1 },
//   { name: 'powerofattorney', maxCount: 1 },
//   { name: 'annexure2', maxCount: 1 },
//   { name: 'applicationform', maxCount: 1 }
// ]),getDocuments);

// post api for plant_details
router.post("/setPlantDetails/:client_id", setPlantDetails)

// post api for Liasoning details
router.post("/setLiasoningDetails/:client_id", setLiasoningDetails)

//post api for commercial Details
router.post("/addCommercialDetails/:client_id",addCommercialDetails)

//post ap for payment details
router.post("/addPaymentDetails/:client_id",addPaymentDetails)

//get all work orders
router.get("/get_all_work_orders",get_all_work_orders)

//get client work order
router.post("/get_client_work_details/:customerId",get_client_work_details)
module.exports = router;