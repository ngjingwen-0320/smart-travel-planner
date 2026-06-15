// require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const app = require('./app');

// Connect to MongoDB
const DB = process.env.MONGO_URI;

mongoose.connect(DB)
  .then(() => console.log('✅ MongoDB Connection Successful!'))
  .catch(err => console.error('❌ DB Connection Error:', err));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}...`);
});