const Room = require('../models/Room');
const User = require('../models/User');

// @route POST /api/rooms  (admin only)
const createRoom = async (req, res) => {
  try {
    const { roomNumber, block, floor, capacity, roomType } = req.body;
    if (!roomNumber || !block || floor === undefined || !capacity) {
      return res.status(400).json({ message: 'roomNumber, block, floor and capacity are required' });
    }
    const room = await Room.create({ roomNumber, block, floor, capacity, roomType });
    return res.status(201).json({ room });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A room with this roomNumber already exists' });
    }
    return res.status(500).json({ message: 'Failed to create room', error: err.message });
  }
};

// @route GET /api/rooms  (any logged-in user)
const getRooms = async (req, res) => {
  try {
    const { status, block } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (block) filter.block = block;

    const rooms = await Room.find(filter).populate('occupants', 'name rollNumber email');
    return res.json({ rooms });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch rooms', error: err.message });
  }
};

// @route GET /api/rooms/:id
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('occupants', 'name rollNumber email');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    return res.json({ room });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch room', error: err.message });
  }
};

// @route PUT /api/rooms/:id/allocate  (admin only) — assign a student to this room
const allocateRoom = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: 'studentId is required' });

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'studentId must belong to a valid student' });
    }

    if (student.room) {
      return res.status(400).json({ message: 'This student is already allocated a room. Deallocate first.' });
    }

    if (room.occupants.length >= room.capacity) {
      return res.status(400).json({ message: 'Room is already at full capacity' });
    }

    room.occupants.push(student._id);
    await room.save();

    student.room = room._id;
    await student.save();

    return res.json({ message: 'Room allocated successfully', room });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to allocate room', error: err.message });
  }
};

// @route PUT /api/rooms/:id/deallocate  (admin only) — remove a student from this room
const deallocateRoom = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: 'studentId is required' });

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    room.occupants = room.occupants.filter((id) => id.toString() !== studentId);
    await room.save();

    await User.findByIdAndUpdate(studentId, { room: null });

    return res.json({ message: 'Student removed from room', room });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to deallocate room', error: err.message });
  }
};

// @route PUT /api/rooms/:id  (admin only) — edit room details (e.g. set maintenance status)
const updateRoom = async (req, res) => {
  try {
    const { block, floor, capacity, roomType, status } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (block !== undefined) room.block = block;
    if (floor !== undefined) room.floor = floor;
    if (capacity !== undefined) room.capacity = capacity;
    if (roomType !== undefined) room.roomType = roomType;
    if (status !== undefined) room.status = status; // e.g. 'maintenance'

    await room.save();
    return res.json({ room });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update room', error: err.message });
  }
};

// @route DELETE /api/rooms/:id  (admin only)
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.occupants.length > 0) {
      return res.status(400).json({ message: 'Cannot delete a room that still has occupants' });
    }

    await room.deleteOne();
    return res.json({ message: 'Room deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete room', error: err.message });
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  allocateRoom,
  deallocateRoom,
  updateRoom,
  deleteRoom,
};
