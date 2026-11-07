const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    category: {
      type: String,
      enum: ['electrical', 'plumbing', 'furniture', 'mess', 'cleanliness', 'other'],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'rejected'],
      default: 'open',
    },
    adminRemarks: { type: String, trim: true },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
