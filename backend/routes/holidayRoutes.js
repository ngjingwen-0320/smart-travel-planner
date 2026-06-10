const express = require('express');
const router = express.Router();

const holidayController = require('../controllers/holidayController');

router.get('/:year/:country', holidayController.getHolidays);

module.exports = router;