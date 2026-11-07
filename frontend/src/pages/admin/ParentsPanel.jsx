import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StudentPicker from '../../components/StudentPicker';

const ParentsPanel = () => {
  const [parents, setParents] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [linking, setLinking] = useState(null); // parent id being edited
  const [selectedStudent, setSelectedStudent] = useState(null);

  const load = async () => {
    try {
      const res = await api.get('/users', { params: { role: 'parent' } });
      setParents(res.data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load parents');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleLink = async (parentId) => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/users/${parentId}/ward`, { studentId: selectedStudent?._id || null });
      setSuccess('Ward linked successfully.');
      setLinking(null);
      setSelectedStudent(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to link ward');
    }
  };

  const handleUnlink = async (parentId) => {
    setError('');
    try {
      await api.put(`/users/${parentId}/ward`, { studentId: null });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unlink ward');
    }
  };

  return (
    <div className="card">
      <h2>Parent accounts — link to a ward</h2>
      <p className="muted">
        Parents can only view attendance for the student linked here. A parent's own registration doesn't set this
        automatically, so link each one manually.
      </p>
      {error && <div className="error-text">{error}</div>}
      {success && <div className="success-text">{success}</div>}
      <table>
        <thead>
          <tr>
            <th>Parent</th>
            <th>Email</th>
            <th>Linked ward</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {parents.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.email}</td>
              <td>{p.ward ? <>{p.ward.name} <span className="muted">· {p.ward.rollNumber || 'no roll no.'}</span></> : <span className="muted">Not linked</span>}</td>
              <td>
                {linking === p._id ? (
                  <div style={{ display: 'flex', gap: 6, minWidth: 220 }}>
                    <div style={{ flex: 1 }}>
                      <StudentPicker onSelect={setSelectedStudent} />
                    </div>
                    <button className="btn" style={{ padding: '6px 10px' }} onClick={() => handleLink(p._id)}>
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      className="btn secondary"
                      onClick={() => {
                        setLinking(p._id);
                        setSelectedStudent(null);
                      }}
                    >
                      {p.ward ? 'Change' : 'Link'}
                    </button>{' '}
                    {p.ward && (
                      <button className="btn danger" onClick={() => handleUnlink(p._id)}>
                        Unlink
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
          {parents.length === 0 && (
            <tr><td colSpan={4} className="muted">No parent accounts registered yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ParentsPanel;
