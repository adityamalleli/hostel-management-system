const express = require('express');
const { getWeeklyMenu, getTodayMenu, upsertDayMenu } = require('../controllers/messController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect);

router.get('/', getWeeklyMenu);
router.get('/today', getTodayMenu);
router.put('/:day', authorize('admin', 'mess_staff'), upsertDayMenu);

module.exports = router;
