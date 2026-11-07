const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @route POST /api/auth/register
// In production you'd lock this down (e.g. only admin can create mess_staff/admin accounts).
// For the mini project, it's left open so you can seed test users easily.
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, rollNumber, ward } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      rollNumber: role === 'student' ? rollNumber : undefined,
      ward: role === 'parent' ? ward : undefined,
    });

    return res.status(201).json({
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated' });
    }

    return res.json({
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('room', 'roomNumber block floor')
    .populate('ward', 'name rollNumber');
  return res.json({ user });
};

module.exports = { register, login, getMe };
