const express = require('express');
const { getCurrencyRate } = require('../controllers/currencyConvertController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/convert', protect, getCurrencyRate);

module.exports = router;