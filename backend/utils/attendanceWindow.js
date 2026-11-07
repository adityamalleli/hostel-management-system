// Reads the configured check-in window from .env and figures out
// whether "now" counts as present, late, or outside the window entirely.

const parseTimeToday = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

const getWindow = () => {
  const start = process.env.ATTENDANCE_WINDOW_START || '19:00';
  const end = process.env.ATTENDANCE_WINDOW_END || '22:00';
  const lateAfter = process.env.ATTENDANCE_LATE_AFTER || '20:30';
  return {
    start: parseTimeToday(start),
    end: parseTimeToday(end),
    lateAfter: parseTimeToday(lateAfter),
  };
};

// Returns 'present' | 'late' | null (null = outside the check-in window)
const evaluateCheckInStatus = (now = new Date()) => {
  const { start, end, lateAfter } = getWindow();

  if (now < start || now > end) return null;
  return now <= lateAfter ? 'present' : 'late';
};

const todayDateString = (d = new Date()) => d.toISOString().slice(0, 10); // 'YYYY-MM-DD'

module.exports = { evaluateCheckInStatus, todayDateString, getWindow };
