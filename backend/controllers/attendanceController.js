const jwt = require('jsonwebtoken');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { evaluateCheckInStatus, todayDateString, getWindow } = require('../utils/attendanceWindow');
const { runAutoAbsentSweep } = require('../jobs/autoAbsentJob');

const QR_TTL_SECONDS = () => Number(process.env.QR_TOKEN_TTL_SECONDS || 40);
const requireQr = () => (process.env.ATTENDANCE_REQUIRE_QR || 'true') === 'true';
const hhmm = (d) => d.toTimeString().slice(0, 5);

// @route GET /api/attendance/config  (any logged-in user)
const getConfig = (req, res) => {
  const { start, end, lateAfter } = getWindow();
  return res.json({
    requireQr: requireQr(),
    qrTtlSeconds: QR_TTL_SECONDS(),
    window: { start: hhmm(start), end: hhmm(end), lateAfter: hhmm(lateAfter) },
  });
};

// Shared logic for every way a student can check in (QR scan or plain button)
const performCheckIn = async (req, res, method) => {
  try {
    const date = todayDateString();
    const status = evaluateCheckInStatus();

    if (!status) {
      const { start, end } = getWindow();
      return res.status(400).json({
        message: `Check-in is only allowed between ${hhmm(start)} and ${hhmm(end)}`,
      });
    }

    const existing = await Attendance.findOne({ student: req.user._id, date });
    if (existing) {
      return res.status(400).json({ message: 'You have already checked in today', attendance: existing });
    }

    const attendance = await Attendance.create({
      student: req.user._id,
      date,
      status,
      checkInTime: new Date(),
      markedBy: 'self',
      method,
    });

    return res.status(201).json({ message: `Checked in — marked ${status}`, attendance });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already checked in today' });
    }
    return res.status(500).json({ message: 'Check-in failed', error: err.message });
  }
};

// @route POST /api/attendance/checkin  (student) — plain button check-in, disabled when QR is required
const checkIn = (req, res) => {
  if (requireQr()) {
    return res.status(403).json({
      message: 'Button check-in is disabled. Scan the QR code shown on the warden\'s screen.',
    });
  }
  return performCheckIn(req, res, 'button');
};

// @route GET /api/attendance/qr/token  (admin) — short-lived signed token that the warden's screen shows as a QR
const generateQrToken = (req, res) => {
  const ttl = QR_TTL_SECONDS();
  const token = jwt.sign({ purpose: 'attendance-qr' }, process.env.JWT_SECRET, { expiresIn: ttl });
  return res.json({ token, expiresInSeconds: ttl, date: todayDateString() });
};

// @route POST /api/attendance/qr/scan  (student) — body: { token } read from the QR
const scanQr = (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'QR token is required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== 'attendance-qr') throw new Error('wrong token type');
  } catch (err) {
    return res.status(400).json({
      message: 'This QR code has expired or is invalid. Scan the latest code on the warden\'s screen.',
    });
  }

  return performCheckIn(req, res, 'qr');
};

// @route GET /api/attendance/me  (student) — own history
const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.user._id }).sort({ date: -1 });
    return res.json({ records });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch attendance', error: err.message });
  }
};

// @route GET /api/attendance/student/:studentId  (admin or that student's parent)
const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (req.user.role === 'parent') {
      const parent = await User.findById(req.user._id);
      if (!parent.ward || parent.ward.toString() !== studentId) {
        return res.status(403).json({ message: 'Not authorized to view this student\'s attendance' });
      }
    }

    const records = await Attendance.find({ student: studentId }).sort({ date: -1 });

    const total = records.length;
    const presentCount = records.filter((r) => r.status === 'present' || r.status === 'late').length;
    const percentage = total > 0 ? ((presentCount / total) * 100).toFixed(1) : '0.0';

    return res.json({ records, summary: { total, presentCount, percentage } });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch attendance', error: err.message });
  }
};

// @route GET /api/attendance/date/:date  (admin) — e.g. /api/attendance/date/2026-11-03
const getAttendanceByDate = async (req, res) => {
  try {
    const records = await Attendance.find({ date: req.params.date })
      .populate({
        path: 'student',
        select: 'name rollNumber room',
        populate: { path: 'room', select: 'roomNumber block' },
      })
      .sort({ checkInTime: -1 });
    return res.json({ records });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch attendance', error: err.message });
  }
};

// @route PUT /api/attendance/:id  (admin only) — override a record, e.g. mark 'on_leave'
const updateAttendance = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['present', 'late', 'absent', 'on_leave'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const record = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status, markedBy: 'warden', method: 'warden' },
      { new: true }
    );
    if (!record) return res.status(404).json({ message: 'Attendance record not found' });

    return res.json({ record });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update attendance', error: err.message });
  }
};

// @route POST /api/attendance/auto-absent/run  (admin) — run the absent sweep on demand.
// Free hosting can put the server to sleep, so the nightly cron may be missed; this is the manual backup.
const runAbsentSweepNow = async (req, res) => {
  try {
    const marked = await runAutoAbsentSweep();
    return res.json({ message: `Marked ${marked} student(s) absent for today`, marked });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to run absent sweep', error: err.message });
  }
};

module.exports = {
  runAbsentSweepNow,
  getConfig,
  checkIn,
  generateQrToken,
  scanQr,
  getMyAttendance,
  getStudentAttendance,
  getAttendanceByDate,
  updateAttendance,
};
