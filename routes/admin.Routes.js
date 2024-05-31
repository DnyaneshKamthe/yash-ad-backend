const express = require('express')
const router = express.Router();
const adminController = require('../controllers/admin.controller')
const multer = require('multer');
const upload = multer(); // Initialize multer
const checkAuth = require("../middleware/checkAuth")


router.post("/addEmployee",upload.none(),adminController.addEmployee);
router.get("/getAllEmployees",adminController.getAllEmployees)
router.post("/updateEmpoyeeDetails/:empId",adminController.updateEmpoyeeDetails)
router.post("/deleteEmployee",adminController.deleteEmployee)


module.exports = router