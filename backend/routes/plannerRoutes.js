const express = require('express');
const router = express.Router();
const { getCombinedPlanner } = require('../controllers/plannerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:tripId', protect, getCombinedPlanner);

module.exports = router;