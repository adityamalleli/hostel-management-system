const Complaint = require('../models/Complaint');
const { notifyUser, notifyAdmins } = require('../utils/notify');

// @route POST /api/complaints  (student only)
const createComplaint = async (req, res) => {
  try {
    const { category, description } = req.body;
    if (!category || !description) {
      return res.status(400).json({ message: 'category and description are required' });
    }

    const complaint = await Complaint.create({
      student: req.user._id,
      room: req.user.room || undefined,
      category,
      description,
    });

    await notifyAdmins({
      title: 'New complaint raised',
      message: `${req.user.name} reported a ${category} issue.`,
      type: 'complaint',
      link: '/admin/complaints',
    });

    return res.status(201).json({ complaint });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create complaint', error: err.message });
  }
};

// @route GET /api/complaints
// Students see only their own complaints; admin sees everyone's (optionally filtered by status)
const getComplaints = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'student') {
      filter.student = req.user._id;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const complaints = await Complaint.find(filter)
      .populate('student', 'name rollNumber email')
      .populate('room', 'roomNumber block')
      .sort({ createdAt: -1 });

    return res.json({ complaints });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch complaints', error: err.message });
  }
};

// @route GET /api/complaints/:id
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('student', 'name rollNumber email')
      .populate('room', 'roomNumber block');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // A student can only view their own complaint
    if (req.user.role === 'student' && complaint.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this complaint' });
    }

    return res.json({ complaint });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch complaint', error: err.message });
  }
};

// @route PUT /api/complaints/:id/status  (admin only) — update status / add remarks
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (status) {
      complaint.status = status;
      if (status === 'resolved') complaint.resolvedAt = new Date();
    }
    if (adminRemarks !== undefined) complaint.adminRemarks = adminRemarks;

    await complaint.save();

    const label = complaint.status.replace('_', ' ');
    await notifyUser(complaint.student, {
      title: `Complaint ${label}`,
      message: `Your ${complaint.category} complaint is now ${label}.${
        complaint.adminRemarks ? ` Warden's remark: ${complaint.adminRemarks}` : ''
      }`,
      type: 'complaint',
      link: '/student/complaints',
    });

    return res.json({ complaint });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update complaint', error: err.message });
  }
};

// @route DELETE /api/complaints/:id  (student: own + only while 'open'; admin: any)
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (req.user.role === 'student') {
      const isOwner = complaint.student.toString() === req.user._id.toString();
      if (!isOwner || complaint.status !== 'open') {
        return res.status(403).json({ message: 'You can only delete your own open complaints' });
      }
    }

    await complaint.deleteOne();
    return res.json({ message: 'Complaint deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete complaint', error: err.message });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint,
};
