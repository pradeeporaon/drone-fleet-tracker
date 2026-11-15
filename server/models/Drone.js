const mongoose = require('mongoose');
// The schema defines the fields and validation rules of each drone.
const schema = new mongoose.Schema({
  serialNumber: { type: String, required: true, trim: true, maxlength: 80, unique: true },
  model: { type: String, required: true, trim: true, maxlength: 100 },
  status: { type: String, enum: ['active', 'under_maintenance', 'retired'], default: 'active' },
  flightHours: { type: Number, min: 0, default: 0 }
}, { timestamps: true });
module.exports = mongoose.model('Drone', schema);
