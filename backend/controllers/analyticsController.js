const User = require('../models/User');
const Room = require('../models/Room');
const Complaint = require('../models/Complaint');
const Attendance = require('../models/Attendance');

const lastNDates = (n) => {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
};

// @route GET /api/analytics/overview  (admin only)
const getOverview = async (req, res) => {
  try {
    const dates = lastNDates(14);
    const today = dates[dates.length - 1];

    const [totalStudents, allocatedStudents, rooms, statusAgg, categoryAgg, attendanceAgg] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', room: { $ne: null } }),
      Room.find().select('block capacity occupants status'),
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Attendance.aggregate([
        { $match: { date: { $in: dates } } },
        { $group: { _id: { date: '$date', status: '$status' }, count: { $sum: 1 } } },
      ]),
    ]);

    // Occupancy overall + per block
    const blockMap = {};
    let totalCapacity = 0;
    let totalOccupied = 0;
    rooms.forEach((r) => {
      totalCapacity += r.capacity;
      totalOccupied += r.occupants.length;
      if (!blockMap[r.block]) blockMap[r.block] = { block: r.block, capacity: 0, occupied: 0 };
      blockMap[r.block].capacity += r.capacity;
      blockMap[r.block].occupied += r.occupants.length;
    });

    // Attendance trend: one row per day with a count for each status
    const trend = dates.map((date) => ({ date, present: 0, late: 0, absent: 0, on_leave: 0 }));
    attendanceAgg.forEach(({ _id, count }) => {
      const row = trend.find((t) => t.date === _id.date);
      if (row) row[_id.status] = count;
    });
    const todayRow = trend.find((t) => t.date === today);
    const todayMarked = todayRow.present + todayRow.late + todayRow.absent + todayRow.on_leave;

    const statusCounts = { open: 0, in_progress: 0, resolved: 0, rejected: 0 };
    statusAgg.forEach((s) => { statusCounts[s._id] = s.count; });

    return res.json({
      totals: {
        students: totalStudents,
        allocatedStudents,
        rooms: rooms.length,
        capacity: totalCapacity,
        occupied: totalOccupied,
        occupancyRate: totalCapacity ? Math.round((totalOccupied / totalCapacity) * 100) : 0,
        openComplaints: statusCounts.open + statusCounts.in_progress,
        todayPresent: todayRow.present + todayRow.late,
        todayMarked,
        todayRate: totalStudents ? Math.round(((todayRow.present + todayRow.late) / totalStudents) * 100) : 0,
      },
      complaintsByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
      complaintsByCategory: categoryAgg.map((c) => ({ category: c._id, count: c.count })),
      occupancyByBlock: Object.values(blockMap),
      attendanceTrend: trend,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to build analytics', error: err.message });
  }
};

module.exports = { getOverview };
