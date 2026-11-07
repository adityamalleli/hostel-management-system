import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, CalendarCheck, MessageSquare, ScanLine } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';

const MEALS = ['breakfast', 'lunch', 'snacks', 'dinner'];

const Overview = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [today, setToday] = useState(null);

  useEffect(() => {
    api.get('/attendance/me').then((r) => setRecords(r.data.records)).catch(() => {});
    api.get('/complaints').then((r) => setComplaints(r.data.complaints)).catch(() => {});
    api.get('/mess/today').then((r) => setToday(r.data)).catch(() => {});
  }, []);

  const attended = records.filter((r) => r.status === 'present' || r.status === 'late').length;
  const pct = records.length ? Math.round((attended / records.length) * 100) : 0;
  const open = complaints.filter((c) => c.status === 'open' || c.status === 'in_progress').length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecord = records.find((r) => r.date === todayStr);

  return (
    <div>
      <div className="grid grid-3">
        <StatCard
          icon={BedDouble} tone="navy" label="My room"
          value={user.room ? user.room.roomNumber : '—'}
          sub={user.room ? `Block ${user.room.block} · Floor ${user.room.floor}` : 'Not allocated yet'}
        />
        <StatCard icon={CalendarCheck} tone="teal" label="Attendance" value={`${pct}%`} sub={`${attended} of ${records.length} days`} />
        <StatCard icon={MessageSquare} tone="amber" label="Open complaints" value={open} sub={`${complaints.length} raised in total`} />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>Today's attendance</h2>
          {todayRecord ? (
            <p style={{ margin: 0 }}>
              You're marked <span className={`badge ${todayRecord.status}`}>{todayRecord.status}</span>{' '}
              {todayRecord.checkInTime && <span className="muted">at {new Date(todayRecord.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
            </p>
          ) : (
            <>
              <p className="muted" style={{ marginTop: 0 }}>You haven't checked in yet. Scan the QR code on the warden's screen during the check-in window.</p>
              <Link to="/student/attendance" className="btn"><ScanLine size={16} /> Go to check-in</Link>
            </>
          )}
          <div className="mt-16">
            <Link to="/student/complaints" className="btn secondary"><MessageSquare size={16} /> Raise a complaint</Link>
          </div>
        </div>

        <div className="card">
          <h2>Today's mess menu{today?.day ? ` · ${today.day}` : ''}</h2>
          {today?.menu ? (
            MEALS.map((m) => (
              <div className="meal-row" key={m}>
                <span className="meal-name">{m}</span>
                <span>{today.menu[m] || '—'}</span>
              </div>
            ))
          ) : <div className="empty">The menu for today hasn't been published yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default Overview;
