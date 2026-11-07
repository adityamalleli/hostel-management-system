import { useEffect, useState } from 'react';
import { CalendarCheck, CheckCircle2, XCircle, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import Ring from '../../components/Ring';
import MessMenuView from '../../components/MessMenuView';

const ParentDashboard = () => {
  const { user } = useAuth();
  const wardId = user.ward?._id || user.ward;
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!wardId) return;
    api.get(`/attendance/student/${wardId}`)
      .then((res) => { setRecords(res.data.records); setSummary(res.data.summary); })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load attendance'));
  }, [wardId]);

  if (!wardId) {
    return (
      <div className="card empty">
        <UserRound size={36} style={{ marginBottom: 8 }} />
        <div style={{ fontWeight: 650, color: 'var(--navy-700)' }}>No ward linked yet</div>
        <p className="muted">Ask the warden to link your account to your child's student profile. Attendance will appear here once that's done.</p>
      </div>
    );
  }

  const absent = records.filter((r) => r.status === 'absent').length;

  return (
    <div>
      {error && <div className="error-text">{error}</div>}
      <div className="grid grid-3">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Ring percent={Number(summary?.percentage || 0)} size={116} stroke={11} />
          <div>
            <div className="stat-label">Ward</div>
            <div style={{ fontWeight: 700, color: 'var(--navy-700)', fontSize: '1.05rem' }}>{user.ward?.name || 'Linked student'}</div>
            <div className="muted">{user.ward?.rollNumber || ''}</div>
          </div>
        </div>
        <StatCard icon={CheckCircle2} tone="green" label="Days present or late" value={summary?.presentCount ?? 0} sub={`of ${summary?.total ?? 0} recorded days`} />
        <StatCard icon={XCircle} tone="red" label="Days absent" value={absent} sub="includes auto-marked absences" />
      </div>

      <div className="card mt-16">
        <h2><CalendarCheck size={16} style={{ verticalAlign: '-2px' }} /> Attendance history</h2>
        <table>
          <thead><tr><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}><td>{r.date}</td><td><span className={`badge ${r.status}`}>{r.status}</span></td></tr>
            ))}
            {records.length === 0 && <tr><td colSpan={2} className="empty">No attendance records yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <MessMenuView />
    </div>
  );
};

export default ParentDashboard;
