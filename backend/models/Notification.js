const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, trim: true, default: '' },
    type: { type: String, enum: ['complaint', 'attendance', 'system'], default: 'system' },
    link: { type: String, trim: true }, // frontend route to open when clicked
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
