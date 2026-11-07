const express = require('express');
const {
  createRoom,
  getRooms,
  getRoomById,
  allocateRoom,
  deallocateRoom,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect); // every room route requires login

router.get('/', getRooms);
router.get('/:id', getRoomById);

router.post('/', authorize('admin'), createRoom);
router.put('/:id', authorize('admin'), updateRoom);
router.put('/:id/allocate', authorize('admin'), allocateRoom);
router.put('/:id/deallocate', authorize('admin'), deallocateRoom);
router.delete('/:id', authorize('admin'), deleteRoom);

module.exports = router;
