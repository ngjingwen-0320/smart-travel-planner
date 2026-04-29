const Trip = require('../models/Trip');

// Create a new trip
exports.createTrip = async (req, res) => {
  try {
    const newTrip = await Trip.create({
      ...req.body,
      user: req.user.id // Automatically set from the logged-in user
    });

    res.status(201).json({
      success: true,
      data: newTrip
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all trips for the logged-in user
exports.getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      results: trips.length,
      data: trips
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 3. GET a single trip
exports.getTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });

    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    res.status(200).json({ success: true, data: trip });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 4. UPDATE a trip
// exports.updateTrip = async (req, res) => {
//   try {
//     const trip = await Trip.findOneAndUpdate(
//       { _id: req.params.id, user: req.user.id },
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

//     res.status(200).json({ success: true, data: trip });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// };
// 4. UPDATE a trip
exports.updateTrip = async (req, res) => {
  try {
    const { startDate, endDate, budget } = req.body;

    // 1. MANUAL VALIDATION (Bypasses the Mongoose 'this.startDate' bug)
    if (startDate && endDate) {
      if (new Date(endDate) < new Date(startDate)) {
        return res.status(400).json({ 
          success: false, 
          message: 'End date must be after or equal to the start date' 
        });
      }
    }

    if (budget !== undefined && budget < 0) {
        return res.status(400).json({
            success: false,
            message: 'Budget must be a positive number'
        });
    }

    // 2. UPDATE THE TRIP
    // We send req.body directly because frontend already formatted the dates 
    // as "YYYY-MM-DDT00:00:00.000Z"
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body, 
      { 
        returnDocument: 'after', 
        runValidators: false, // Set to false to bypass the broken Model validator
        context: 'query'
      }
    );

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    res.status(200).json({ success: true, data: trip });
  } catch (err) {
    console.error("Update Trip Error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

// 5. DELETE a trip
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    res.status(204).json({ success: true, data: null });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};