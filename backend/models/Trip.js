const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'A trip must have a title'],
    trim: true
  },
  destination: { 
    type: String, 
    required: [true, 'Destination cannot be empty'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'A trip must have a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'A trip must have an end date'],
    // CUSTOM VALIDATION: End date must be after Start date
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date ({VALUE}) must be after the start date'
    }
  },
  // endDate: {
  //   type: Date,
  //   required: [true, 'A trip must have an end date'],
  //   validate: {
  //     validator: function(value) {
  //       // 'value' is the endDate being saved
        
  //       // 1. Get the update object (used during findOneAndUpdate)
  //       const update = this.getUpdate ? this.getUpdate() : null;
        
  //       // 2. Determine the startDate. We look in 3 places:
  //       //    a) this.startDate (Works for .create() or .save())
  //       //    b) update.$set.startDate (Works for updates where startDate is changing)
  //       //    c) update.startDate (Works for simpler update calls)
  //       const startDate = this.startDate || (update && (update.$set?.startDate || update.startDate));

  //       // 3. IMPORTANT: If we are updating ONLY the endDate, the startDate won't 
  //       //    be in the 'update' object. In this specific case, Mongoose validators 
  //       //    cannot see the existing startDate in the DB.
  //       //    If startDate is missing, we skip validation here and let the 
  //       //    frontend or controller handle it to avoid "false failures".
  //       if (!startDate) return true;

  //       return new Date(value) >= new Date(startDate);
  //     },
  //     message: 'End date must be the same day or after the start date'
  //   }
  // },
  budget: { 
    type: Number, 
    default: 0,
    min: [0, 'Budget must be a positive number'] // Prevents negative budgets
  },
  preferences: {
    type: [String], // Ensures it is an array of strings
    default: []
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be longer than 500 characters']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A trip must belong to a user']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Trip', tripSchema);