const express = require('express');
const { getWeather } = require('../controllers/weatherController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Only logged in users can check the weather
router.get('/:city', protect, getWeather);

module.exports = router;