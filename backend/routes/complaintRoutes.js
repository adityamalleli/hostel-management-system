const express = require('express');
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect);

router.post('/', authorize('student'), createComplaint);
router.get('/', getComplaints); // scoped per-role inside the controller
router.get('/:id', getComplaintById);
router.put('/:id/status', authorize('admin'), updateComplaintStatus);
router.delete('/:id', authorize('student', 'admin'), deleteComplaint);

module.exports = router;
