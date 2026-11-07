const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true, trim: true },
    block: { type: String, required: true, trim: true },
    floor: { type: Number, required: true },
    capacity: { type: Number, required: true, min: 1 },
    occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    roomType: {
      type: String,
      enum: ['single', 'double', 'triple', 'dormitory'],
      default: 'double',
    },
    status: {
      type: String,
      enum: ['available', 'full', 'maintenance'],
      default: 'available',
    },
  },
  { timestamps: true }
);

// Keep status in sync with occupancy whenever a room is saved
roomSchema.pre('save', function (next) {
  if (this.status !== 'maintenance') {
    this.status = this.occupants.length >= this.capacity ? 'full' : 'available';
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema);
