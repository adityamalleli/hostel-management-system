require('dotenv').config();
// Hosted servers (Render etc.) run in UTC. The attendance window and cron job use local
// time, so pin the process to Indian Standard Time unless TZ is set explicitly.
process.env.TZ = process.env.TZ || 'Asia/Kolkata';
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const messRoutes = require('./routes/messRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { scheduleAutoAbsentJob } = require('./jobs/autoAbsentJob');

connectDB();

const app = express();

// Set CLIENT_ORIGIN (comma-separated) to restrict browser access to your deployed frontend.
const allowedOrigins = (process.env.CLIENT_ORIGIN || '').split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : undefined));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hostel Management System API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

scheduleAutoAbsentJob();

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
