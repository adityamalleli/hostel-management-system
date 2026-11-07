const Notification = require('../models/Notification');

// @route GET /api/notifications  — latest 30 for the logged-in user, plus unread count
const getMyNotifications = async (req, res) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30),
      Notification.countDocuments({ user: req.user._id, read: false }),
    ]);
    return res.json({ notifications, unreadCount });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
};

// @route PUT /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    return res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update notifications', error: err.message });
  }
};

// @route PUT /api/notifications/:id/read
const markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true });
    return res.json({ message: 'Marked as read' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update notification', error: err.message });
  }
};

module.exports = { getMyNotifications, markAllRead, markRead };
