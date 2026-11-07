import { useEffect, useState } from 'react';
import { UserX } from 'lucide-react';
import api from '../../api/axios';

const todayStr = () => new Date().toISOString().slice(0, 10);

const AttendancePanel = () => {
  const [date, setDate] = useState(todayStr());
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState('');

  const loadByDate = async (d = date) => {
    setError('');
    try {
      const res = await api.get(`/attendance/date/${d}`);
      setRecords(res.data.records);
      setLoaded(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load attendance');
    }
  };

  useEffect(() => {
    loadByDate(todayStr());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAbsentees = async () => {
    if (!window.confirm('Mark every student who has not checked in today as absent?')) return;
    setError('');
    setNotice('');
    try {
      const res = await api.post('/attendance/auto-absent/run');
      setNotice(res.data.message);
      if (date === todayStr()) loadByDate();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark absentees');
    }
  };

  const handleOverride = async (id, status) => {
    try {
      await api.put(`/attendance/${id}`, { status });
      loadByDate();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update record');
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 6 }}>
        <div style={{ minWidth: 200 }}>
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ marginBottom: 0 }} />
        </div>
        <button className="btn" onClick={() => loadByDate()}>Load records</button>
        <button className="btn secondary" onClick={markAbsentees} title="Run this after the check-in window closes">
          <UserX size={16} /> Mark absentees now
        </button>
      </div>
      {error && <div className="error-text mt-16">{error}</div>}
      {notice && <div className="success-text mt-16">{notice}</div>}

      {loaded && (
        <table className="mt-16">
          <thead>
            <tr><th>Student</th><th>Room</th><th>Status</th><th>Method</th><th>Check-in time</th><th>Override</th></tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td>{r.student?.name} <div className="muted">{r.student?.rollNumber}</div></td>
                <td>{r.student?.room?.roomNumber || '—'}</td>
                <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                <td>{r.method ? <span className={`badge ${r.method === 'qr' ? 'qr' : 'neutral'}`}>{r.method}</span> : '—'}</td>
                <td>{r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '—'}</td>
                <td>
                  <select value={r.status} onChange={(e) => handleOverride(r._id, e.target.value)} style={{ margin: 0, width: 130 }}>
                    <option value="present">present</option>
                    <option value="late">late</option>
                    <option value="absent">absent</option>
                    <option value="on_leave">on leave</option>
                  </select>
                </td>
              </tr>
            ))}
            {records.length === 0 && <tr><td colSpan={6} className="empty">No attendance records for this date yet.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AttendancePanel;
