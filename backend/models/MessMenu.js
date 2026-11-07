const mongoose = require('mongoose');

const messMenuSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
      unique: true,
    },
    breakfast: { type: String, trim: true, default: '' },
    lunch: { type: String, trim: true, default: '' },
    snacks: { type: String, trim: true, default: '' },
    dinner: { type: String, trim: true, default: '' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MessMenu', messMenuSchema);
