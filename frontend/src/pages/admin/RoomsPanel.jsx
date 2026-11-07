import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StudentPicker from '../../components/StudentPicker';

const RoomsPanel = () => {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ roomNumber: '', block: '', floor: '', capacity: '', roomType: 'double' });
  const [allocating, setAllocating] = useState(null); // roomId being allocated
  const [studentId, setStudentId] = useState('');

  const loadRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data.rooms);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rooms');
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/rooms', {
        ...form,
        floor: Number(form.floor),
        capacity: Number(form.capacity),
      });
      setForm({ roomNumber: '', block: '', floor: '', capacity: '', roomType: 'double' });
      loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    }
  };

  const handleAllocate = async (roomId) => {
    setError('');
    try {
      await api.put(`/rooms/${roomId}/allocate`, { studentId });
      setStudentId('');
      setAllocating(null);
      loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to allocate room');
    }
  };

  const handleDeallocate = async (roomId, occupantId) => {
    setError('');
    try {
      await api.put(`/rooms/${roomId}/deallocate`, { studentId: occupantId });
      loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove student');
    }
  };

  const handleDelete = async (roomId) => {
    setError('');
    try {
      await api.delete(`/rooms/${roomId}`);
      loadRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete room');
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Add a room</h2>
        {error && <div className="error-text">{error}</div>}
        <form onSubmit={handleCreate}>
          <div className="form-row">
            <div>
              <label>Room number</label>
              <input value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} required />
            </div>
            <div>
              <label>Block</label>
              <input value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label>Floor</label>
              <input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} required />
            </div>
            <div>
              <label>Capacity</label>
              <input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
            </div>
          </div>
          <label>Room type</label>
          <select value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })}>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
            <option value="dormitory">Dormitory</option>
          </select>
          <button className="btn" type="submit">Add Room</button>
        </form>
      </div>

      <div className="card">
        <h2>All rooms ({rooms.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Room</th>
              <th>Block / Floor</th>
              <th>Occupancy</th>
              <th>Status</th>
              <th>Occupants</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room._id}>
                <td>{room.roomNumber}</td>
                <td>{room.block} / {room.floor}</td>
                <td>{room.occupants.length}/{room.capacity}</td>
                <td><span className={`badge ${room.status}`}>{room.status}</span></td>
                <td>
                  {room.occupants.map((o) => (
                    <div key={o._id} style={{ marginBottom: 4 }}>
                      {o.name} ({o.rollNumber})
                      <button
                        className="btn secondary"
                        style={{ marginLeft: 8, padding: '2px 8px', fontSize: '0.75rem' }}
                        onClick={() => handleDeallocate(room._id, o._id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </td>
                <td>
                  {allocating === room._id ? (
                    <div style={{ display: 'flex', gap: 6, minWidth: 220 }}>
                      <div style={{ flex: 1 }}>
                        <StudentPicker onSelect={(s) => setStudentId(s._id)} />
                      </div>
                      <button
                        className="btn"
                        style={{ padding: '6px 10px' }}
                        onClick={() => handleAllocate(room._id)}
                        disabled={!studentId}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        className="btn secondary"
                        onClick={() => {
                          setAllocating(room._id);
                          setStudentId('');
                        }}
                      >
                        Allocate
                      </button>{' '}
                      <button className="btn danger" onClick={() => handleDelete(room._id)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomsPanel;
