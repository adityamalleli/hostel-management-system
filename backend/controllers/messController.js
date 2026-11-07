const MessMenu = require('../models/MessMenu');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// @route GET /api/mess  (any logged-in user) — full weekly menu
const getWeeklyMenu = async (req, res) => {
  try {
    const menu = await MessMenu.find().sort({ day: 1 });
    // Keep day order fixed to Mon-Sun regardless of insertion order
    const sorted = DAYS.map((d) => menu.find((m) => m.day === d)).filter(Boolean);
    return res.json({ menu: sorted });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch mess menu', error: err.message });
  }
};

// @route GET /api/mess/today
const getTodayMenu = async (req, res) => {
  try {
    const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]; // JS Sunday=0 -> map to our array
    const menu = await MessMenu.findOne({ day: today });
    return res.json({ day: today, menu: menu || null });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch today\'s menu', error: err.message });
  }
};

// @route PUT /api/mess/:day  (admin or mess_staff) — upsert a single day's menu
// :day is one of Monday..Sunday
const upsertDayMenu = async (req, res) => {
  try {
    const { day } = req.params;
    if (!DAYS.includes(day)) {
      return res.status(400).json({ message: `day must be one of: ${DAYS.join(', ')}` });
    }

    const { breakfast, lunch, snacks, dinner } = req.body;

    const menu = await MessMenu.findOneAndUpdate(
      { day },
      {
        day,
        ...(breakfast !== undefined && { breakfast }),
        ...(lunch !== undefined && { lunch }),
        ...(snacks !== undefined && { snacks }),
        ...(dinner !== undefined && { dinner }),
        updatedBy: req.user._id,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ menu });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update menu', error: err.message });
  }
};

module.exports = { getWeeklyMenu, getTodayMenu, upsertDayMenu };
