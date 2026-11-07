const cron = require('node-cron');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { todayDateString, getWindow } = require('../utils/attendanceWindow');

// Marks every student who did NOT check in today as 'absent'.
// Runs once, shortly after the attendance window closes.
const runAutoAbsentSweep = async () => {
  const date = todayDateString();
  const students = await User.find({ role: 'student' }).select('_id');

  const checkedInIds = new Set(
    (await Attendance.find({ date }).select('student')).map((r) => r.student.toString())
  );

  const toMarkAbsent = students
    .map((s) => s._id.toString())
    .filter((id) => !checkedInIds.has(id));

  if (toMarkAbsent.length === 0) {
    console.log(`[auto-absent] ${date}: everyone already has a record, nothing to do`);
    return 0;
  }

  const docs = toMarkAbsent.map((studentId) => ({
    student: studentId,
    date,
    status: 'absent',
    markedBy: 'warden',
    method: 'auto',
  }));

  // insertMany with ordered:false so one duplicate-key race doesn't abort the rest
  try {
    await Attendance.insertMany(docs, { ordered: false });
  } catch (err) {
    // Duplicate key errors are expected if a student checked in during the sweep; ignore those.
    if (!err.writeErrors) throw err;
  }

  console.log(`[auto-absent] ${date}: marked ${toMarkAbsent.length} student(s) absent`);
  return toMarkAbsent.length;
};

// Schedules the sweep to run daily, a few minutes after the window end time from .env
const scheduleAutoAbsentJob = () => {
  const { end } = getWindow();
  const minute = (end.getMinutes() + 5) % 60; // run 5 minutes after window closes
  const hour = end.getMinutes() + 5 >= 60 ? (end.getHours() + 1) % 24 : end.getHours();

  const cronExpression = `${minute} ${hour} * * *`; // e.g. '5 22 * * *' = 22:05 every day

  cron.schedule(cronExpression, () => {
    runAutoAbsentSweep().catch((err) => console.error('[auto-absent] job failed:', err));
  });

  console.log(`[auto-absent] scheduled daily at ${cronExpression} (cron syntax)`);
};

module.exports = { scheduleAutoAbsentJob, runAutoAbsentSweep };
