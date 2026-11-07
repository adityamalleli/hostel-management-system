const express = require('express');
const { getMyNotifications, markAllRead, markRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', getMyNotifications);
router.put('/read-all', markAllRead); // must come before '/:id/read'
router.put('/:id/read', markRead);

module.exports = router;
