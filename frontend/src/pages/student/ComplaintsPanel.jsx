import { useEffect, useState } from 'react';
import api from '../../api/axios';

const CATEGORIES = ['electrical', 'plumbing', 'furniture', 'mess', 'cleanliness', 'other'];

const ComplaintsPanel = () => {
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ category: 'electrical', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data.complaints);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/complaints', form);
      setForm({ category: 'electrical', description: '' });
      setSuccess('Complaint submitted.');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/complaints/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete complaint');
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Raise a complaint</h2>
        {error && <div className="error-text">{error}</div>}
        {success && <div className="success-text">{success}</div>}
        <form onSubmit={handleSubmit}>
          <label>Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <label>Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <button className="btn" type="submit">Submit Complaint</button>
        </form>
      </div>

      <div className="card">
        <h2>My complaints</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Status</th>
              <th>Remarks</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c._id}>
                <td>{c.category}</td>
                <td style={{ maxWidth: 240 }}>{c.description}</td>
                <td><span className={`badge ${c.status}`}>{c.status}</span></td>
                <td>{c.adminRemarks || '—'}</td>
                <td>
                  {c.status === 'open' && (
                    <button className="btn danger" onClick={() => handleDelete(c._id)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {complaints.length === 0 && (
              <tr><td colSpan={5} className="muted">No complaints raised yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplaintsPanel;
