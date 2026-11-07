const express = require('express');
const {
  runAbsentSweepNow,
  getConfig,
  checkIn,
  generateQrToken,
  scanQr,
  getMyAttendance,
  getStudentAttendance,
  getAttendanceByDate,
  updateAttendance,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

router.use(protect);

router.get('/config', getConfig);
router.post('/checkin', authorize('student'), checkIn);
router.get('/qr/token', authorize('admin'), generateQrToken);
router.post('/auto-absent/run', authorize('admin'), runAbsentSweepNow);
router.post('/qr/scan', authorize('student'), scanQr);
router.get('/me', authorize('student'), getMyAttendance);
router.get('/student/:studentId', authorize('admin', 'parent'), getStudentAttendance);
router.get('/date/:date', authorize('admin'), getAttendanceByDate);
router.put('/:id', authorize('admin'), updateAttendance);

module.exports = router;
