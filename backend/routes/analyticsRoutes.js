const express = require('express');
const { getOverview } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/overview', getOverview);

module.exports = router;
