const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/authRoutes');
const tripRouter = require('./routes/tripRoutes');
const weatherRouter = require('./routes/weatherRoutes');
const placesRouter = require('./routes/placesRoutes');
const plannerRoutes = require('./routes/plannerRoutes');
const currencyRouter = require('./routes/currencyConvertRoutes');
const holidayRouter = require('./routes/holidayRoutes');

const app = express();

app.use(cors());

// 1) MIDDLEWARE
app.use(express.json()); // Parses incoming JSON data

// 2) ROUTES
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/trips', tripRouter);
app.use('/api/v1/weather', weatherRouter);
app.use('/api/v1/places', placesRouter);
app.use('/api/v1/planner', plannerRoutes);
app.use('/api/v1/currency', currencyRouter);
app.use('/api/v1/holidays', holidayRouter);

// Basic health check
app.get('/', (req, res) => {
  res.status(200).send('Smart Travel Planner API is running...');
});

// 3) GLOBAL ERROR HANDLING MIDDLEWARE
// This catches any errors that happen in the controllers
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;