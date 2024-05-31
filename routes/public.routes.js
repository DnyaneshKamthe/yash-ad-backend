// publicRoutes.js
const express = require('express');
const router = express.Router();

// Public route
router.get('/', (req, res) => {
  res.send('Welcome to the public homepage!');
});

router.get('/public-route', (req, res) => {
  res.send('This is a public route.');
});

module.exports = router;
