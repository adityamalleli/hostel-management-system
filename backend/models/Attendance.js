const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // stored as 'YYYY-MM-DD' for easy uniqueness + queries
    status: {
      type: String,
      enum: ['present', 'late', 'absent', 'on_leave'],
      default: 'absent',
    },
    checkInTime: { type: Date },
    markedBy: {
      type: String,
      enum: ['self', 'warden'],
      default: 'self',
    },
    // How the record was created: scanned QR, button tap, auto-absent job, or warden edit
    method: {
      type: String,
      enum: ['qr', 'button', 'auto', 'warden'],
      default: 'button',
    },
  },
  { timestamps: true }
);

// One attendance record per student per day
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
