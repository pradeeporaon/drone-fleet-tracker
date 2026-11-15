
require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');
const Drone = require('./models/Drone');

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI');
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
  });

  console.log('MongoDB connected successfully!');

  await Drone.init();

  app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log(`API running on port ${process.env.PORT || 3000}`);
});
}

start().catch((error) => {
  console.error('Startup failed:', error.message);
  process.exit(1);
});
