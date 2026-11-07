import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ComplaintsPanel from './ComplaintsPanel';
import AttendancePanel from './AttendancePanel';
import MessMenuView from '../../components/MessMenuView';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'complaints', label: 'Complaints' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'mess', label: 'Mess Menu' },
];

const StudentDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');

  return (
    <div className="page">
      <h1>Welcome, {user.name}</h1>
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="card">
          <h2>My details</h2>
          <p><strong>Roll number:</strong> {user.rollNumber || '—'}</p>
          <p><strong>Room:</strong> {user.room ? user.room : 'Not allocated yet'}</p>
          <p className="muted">
            Visit the Complaints tab to report an issue, Attendance to check in, or Mess Menu to see what's being
            served this week.
          </p>
        </div>
      )}
      {tab === 'complaints' && <ComplaintsPanel />}
      {tab === 'attendance' && <AttendancePanel />}
      {tab === 'mess' && <MessMenuView />}
    </div>
  );
};

export default StudentDashboard;
