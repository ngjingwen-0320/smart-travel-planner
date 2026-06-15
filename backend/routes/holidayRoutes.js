const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holidayController');

// GET /holidays/:year/:country
router.get('/:year/:country', holidayController.getHolidays);

module.exports = router;