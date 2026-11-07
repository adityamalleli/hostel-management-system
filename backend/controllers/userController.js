const User = require('../models/User');

// @route GET /api/users  (admin only)
// Query params: role, search (matches name, email, or rollNumber)
const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [{ name: re }, { email: re }, { rollNumber: re }];
    }

    const users = await User.find(filter)
      .select('name email role rollNumber room ward isActive')
      .populate('ward', 'name rollNumber')
      .limit(50);
    return res.json({ users });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// @route GET /api/users/:id  (admin only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('room', 'roomNumber block');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};

// @route PUT /api/users/:id/ward  (admin only) — link a parent account to a student (ward)
const linkWard = async (req, res) => {
  try {
    const { studentId } = req.body;
    const parent = await User.findById(req.params.id);
    if (!parent || parent.role !== 'parent') {
      return res.status(400).json({ message: 'Target user must be a parent account' });
    }

    if (studentId) {
      const student = await User.findById(studentId);
      if (!student || student.role !== 'student') {
        return res.status(400).json({ message: 'studentId must belong to a valid student' });
      }
    }

    parent.ward = studentId || null;
    await parent.save();

    return res.json({ message: 'Ward updated', user: parent });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update ward', error: err.message });
  }
};

module.exports = { getUsers, getUserById, linkWard };
