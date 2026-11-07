const express = require('express');
const { getUsers, getUserById, linkWard } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id/ward', linkWard);

module.exports = router;
