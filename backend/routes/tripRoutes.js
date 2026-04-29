const express = require('express');
const tripController = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Protects all routes below

// Path: /api/v1/trips
router
  .route('/')
  .get(tripController.getMyTrips)
  .post(tripController.createTrip);

// Path: /api/v1/trips/:id
router
  .route('/:id')
  .get(tripController.getTrip)
  .put(tripController.updateTrip)
  .delete(tripController.deleteTrip);

module.exports = router;