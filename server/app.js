const cors = require('cors');
const express = require('express');
const Drone = require('./models/Drone');
const app = express();



// Parse the incoming JSON so routes can access req.body.
app.use(cors());
app.use(express.json({ limit: '16kb' }));
app.get('/api/health', (req, res) => res.json({ message: 'yayyyy..Drone Fleet API is running' }));
app.get('/api/drones', async (req, res) => {
  const drones = await Drone.find().sort({ createdAt: -1 });
  res.json(drones);
});

//added here

// GET: Retrieve a single drone by ID
app.get('/api/drones/:id', async (req, res) => {
  const drone = await Drone.findById(req.params.id);

  if (!drone) {
    return res.status(404).json({
      message: 'Drone not found'
    });
  }

  res.json(drone);
});


// PUT: Update an existing drone
app.put('/api/drones/:id', async (req, res) => {
  const allowedFields = ['serialNumber', 'model', 'status', 'flightHours'];

  const updates = Object.fromEntries(
    Object.entries(req.body || {}).filter(([key]) =>
      allowedFields.includes(key)
    )
  );

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      message: 'No valid fields provided for update'
    });
  }

  const drone = await Drone.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  if (!drone) {
    return res.status(404).json({
      message: 'Drone not found'
    });
  }

  res.json({
    message: 'Drone updated successfully',
    drone
  });
});


// DELETE: Remove a drone
app.delete('/api/drones/:id', async (req, res) => {
  const drone = await Drone.findByIdAndDelete(req.params.id);

  if (!drone) {
    return res.status(404).json({
      message: 'Drone not found'
    });
  }

  res.json({
    message: 'Drone deleted successfully'
  });
});





app.post('/api/drones', async (req, res) => {
  const { serialNumber, model, status, flightHours } = req.body || {};
  if (typeof serialNumber !== 'string' || !serialNumber.trim() || typeof model !== 'string' || !model.trim()) {
    return res.status(400).json({ message: 'serialNumber and model must be non-empty strings' });
  }
  if (flightHours !== undefined && (typeof flightHours !== 'number' || !Number.isFinite(flightHours) || flightHours < 0)) {
    return res.status(400).json({ message: 'flightHours must be a non-negative number' });
  }
  const drone = await Drone.create({ serialNumber, model, status, flightHours });
  res.status(201).json(drone);
});
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  if (err.code === 11000) return res.status(409).json({ message: 'Serial number already registered' });
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.name === 'CastError') {
  return res.status(400).json({ message: 'Invalid drone ID' });
}
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON body' });
  if (err.type === 'entity.too.large') return res.status(413).json({ message: 'Request body too large' });
  console.error(err.message);
  res.status(500).json({ message: 'Server error' });
});
module.exports = app;
