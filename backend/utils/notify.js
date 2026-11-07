const Notification = require('../models/Notification');
const User = require('../models/User');

// Notifications must never break the main request, so errors are swallowed and logged.
const notifyUser = async (userId, { title, message, type = 'system', link }) => {
  try {
    await Notification.create({ user: userId, title, message, type, link });
  } catch (err) {
    console.error('[notify] failed:', err.message);
  }
};

const notifyAdmins = async ({ title, message, type = 'system', link }) => {
  try {
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    if (admins.length === 0) return;
    await Notification.insertMany(admins.map((a) => ({ user: a._id, title, message, type, link })));
  } catch (err) {
    console.error('[notify] failed:', err.message);
  }
};

module.exports = { notifyUser, notifyAdmins };
