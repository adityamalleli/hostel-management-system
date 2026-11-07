import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Users, BedDouble, MessageSquare, CalendarCheck } from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';

const STATUS_COLORS = { open: '#d64545', in_progress: '#e8a838', resolved: '#17855a', rejected: '#94a3b3' };
const TREND_COLORS = { present: '#008591', late: '#e8a838', absent: '#d64545', on_leave: '#94a3b3' };
const label = (s) => s.replace('_', ' ');
const shortDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

const Empty = ({ text }) => <div className="empty">{text}</div>;

const Overview = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/analytics/overview')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load analytics'));
  }, []);

  if (error) return <div className="error-text">{error}</div>;
  if (!data) return <div className="muted">Loading analytics…</div>;

  const { totals, complaintsByStatus, complaintsByCategory, occupancyByBlock, attendanceTrend } = data;
  const statusData = complaintsByStatus.filter((s) => s.count > 0).map((s) => ({ name: label(s.status), key: s.status, value: s.count }));
  const trend = attendanceTrend.map((t) => ({ ...t, label: shortDate(t.date) }));

  return (
    <div>
      <div className="grid grid-4">
        <StatCard icon={Users} tone="navy" label="Students" value={totals.students} sub={`${totals.allocatedStudents} allocated a room`} />
        <StatCard icon={BedDouble} tone="teal" label="Occupancy" value={`${totals.occupancyRate}%`} sub={`${totals.occupied} of ${totals.capacity} beds · ${totals.rooms} rooms`} />
        <StatCard icon={MessageSquare} tone="amber" label="Open complaints" value={totals.openComplaints} sub="open + in progress" />
        <StatCard icon={CalendarCheck} tone="green" label="Present today" value={`${totals.todayRate}%`} sub={`${totals.todayPresent} of ${totals.students} students`} />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>Attendance — last 14 days</h2>
          <div className="chart-box">
            <ResponsiveContainer>
              <BarChart data={trend} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ef" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#5b6b7c' }} axisLine={false} tickLine={false} interval={1} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#5b6b7c' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f4f7fa' }} contentStyle={{ borderRadius: 10, border: '1px solid #e3e8ef' }} />
                {Object.keys(TREND_COLORS).map((k, i, arr) => (
                  <Bar key={k} dataKey={k} name={label(k)} stackId="a" fill={TREND_COLORS[k]} radius={i === arr.length - 1 ? [5, 5, 0, 0] : 0} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="legend-row">
            {Object.entries(TREND_COLORS).map(([k, c]) => (
              <span key={k}><span className="legend-dot" style={{ background: c }} />{label(k)}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Complaints by status</h2>
          {statusData.length === 0 ? <Empty text="No complaints yet." /> : (
            <div className="chart-box">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={98} paddingAngle={3} stroke="none">
                    {statusData.map((s) => <Cell key={s.key} fill={STATUS_COLORS[s.key]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e3e8ef' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, textTransform: 'capitalize' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>Occupancy by block</h2>
          {occupancyByBlock.length === 0 ? <Empty text="Add rooms to see occupancy." /> : (
            <div className="chart-box">
              <ResponsiveContainer>
                <BarChart data={occupancyByBlock} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ef" vertical={false} />
                  <XAxis dataKey="block" tick={{ fontSize: 12, fill: '#5b6b7c' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#5b6b7c' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f4f7fa' }} contentStyle={{ borderRadius: 10, border: '1px solid #e3e8ef' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="capacity" name="Capacity" fill="#cfe9ec" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="occupied" name="Occupied" fill="#008591" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <h2>Complaints by category</h2>
          {complaintsByCategory.length === 0 ? <Empty text="No complaints yet." /> : (
            <div className="chart-box">
              <ResponsiveContainer>
                <BarChart data={complaintsByCategory} layout="vertical" margin={{ top: 6, right: 12, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ef" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#5b6b7c' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="category" width={86} tick={{ fontSize: 12, fill: '#5b6b7c' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f4f7fa' }} contentStyle={{ borderRadius: 10, border: '1px solid #e3e8ef' }} />
                  <Bar dataKey="count" name="Complaints" fill="#17304f" radius={[0, 5, 5, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
