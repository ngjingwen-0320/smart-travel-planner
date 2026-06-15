const express = require('express');
const { getPlaces } = require('../controllers/placesController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/:city', protect, getPlaces);

module.exports = router;