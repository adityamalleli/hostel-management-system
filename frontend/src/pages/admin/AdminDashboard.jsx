import { useState } from 'react';
import RoomsPanel from './RoomsPanel';
import ComplaintsPanel from './ComplaintsPanel';
import AttendancePanel from './AttendancePanel';
import ParentsPanel from './ParentsPanel';
import MessMenuEditor from '../../components/MessMenuEditor';

const TABS = [
  { key: 'rooms', label: 'Rooms' },
  { key: 'complaints', label: 'Complaints' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'parents', label: 'Parents' },
  { key: 'mess', label: 'Mess Menu' },
];

const AdminDashboard = () => {
  const [tab, setTab] = useState('rooms');

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
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

      {tab === 'rooms' && <RoomsPanel />}
      {tab === 'complaints' && <ComplaintsPanel />}
      {tab === 'attendance' && <AttendancePanel />}
      {tab === 'parents' && <ParentsPanel />}
      {tab === 'mess' && <MessMenuEditor />}
    </div>
  );
};

export default AdminDashboard;
