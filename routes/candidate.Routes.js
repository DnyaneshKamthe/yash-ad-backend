const express = require('express')
const router = express.Router();
const candidateController = require('../controllers/candidate.controller')
const multer = require('multer');
const upload = multer(); // Initialize multer
const checkAuth = require("../middleware/checkAuth")


router.post("/addCandidate",upload.none(),candidateController.addCandidate);

router.get("/get_all_candidates", candidateController.get_all_candidates)

module.exports = router