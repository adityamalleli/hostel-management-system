import { useEffect, useState } from 'react';
import api from '../../api/axios';

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'rejected'];

const ComplaintsPanel = () => {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [remarksDraft, setRemarksDraft] = useState({});

  const load = async () => {
    try {
      const res = await api.get('/complaints', { params: filter ? { status: filter } : {} });
      setComplaints(res.data.complaints);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/complaints/${id}/status`, { status, adminRemarks: remarksDraft[id] });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update complaint');
    }
  };

  return (
    <div className="card">
      <h2>Complaints</h2>
      {error && <div className="error-text">{error}</div>}
      <label>Filter by status</label>
      <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ maxWidth: 220 }}>
        <option value="">All</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Category</th>
            <th>Description</th>
            <th>Status</th>
            <th>Remarks</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c._id}>
              <td>{c.student?.name} <div className="muted">{c.student?.rollNumber}</div></td>
              <td>{c.category}</td>
              <td style={{ maxWidth: 220 }}>{c.description}</td>
              <td><span className={`badge ${c.status}`}>{c.status}</span></td>
              <td>
                <input
                  placeholder="Add remark..."
                  defaultValue={c.adminRemarks || ''}
                  onChange={(e) => setRemarksDraft({ ...remarksDraft, [c._id]: e.target.value })}
                  style={{ margin: 0, minWidth: 140 }}
                />
              </td>
              <td>
                <select
                  defaultValue={c.status}
                  onChange={(e) => handleStatusChange(c._id, e.target.value)}
                  style={{ margin: 0 }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
          {complaints.length === 0 && (
            <tr><td colSpan={6} className="muted">No complaints found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ComplaintsPanel;
