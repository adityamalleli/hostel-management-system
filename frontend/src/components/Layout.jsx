import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Building2, LayoutDashboard, BedDouble, MessageSquare, CalendarCheck, QrCode,
  Users, UtensilsCrossed, ScanLine, LogOut, Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import InstallButton from './InstallButton';

const NAV = {
  admin: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/rooms', label: 'Rooms', icon: BedDouble },
    { to: '/admin/complaints', label: 'Complaints', icon: MessageSquare },
    { to: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/admin/qr', label: 'QR Session', icon: QrCode },
    { to: '/admin/parents', label: 'Parents', icon: Users },
    { to: '/admin/mess', label: 'Mess Menu', icon: UtensilsCrossed },
  ],
  student: [
    { to: '/student', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/student/attendance', label: 'Attendance', icon: ScanLine },
    { to: '/student/complaints', label: 'Complaints', icon: MessageSquare },
    { to: '/student/mess', label: 'Mess Menu', icon: UtensilsCrossed },
  ],
  mess_staff: [{ to: '/mess-staff', label: 'Mess Menu', icon: UtensilsCrossed, end: true }],
  parent: [{ to: '/parent', label: 'Ward Overview', icon: LayoutDashboard, end: true }],
};

const ROLE_LABELS = { admin: 'Admin / Warden', student: 'Student', mess_staff: 'Mess Staff', parent: 'Parent' };

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const initials = user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Building2 size={20} /></div>
          <div>
            <div className="brand-name">Hostel Manager</div>
            <div className="brand-sub">CBIT · MCA Mini Project</div>
          </div>
        </div>
        <div className="nav-label">Menu</div>
        <nav className="nav">
          {NAV[user.role].map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">{ROLE_LABELS[user.role]} workspace</div>
      </aside>

      <div className="main" onClick={() => open && setOpen(false)}>
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={(e) => { e.stopPropagation(); setOpen(true); }} aria-label="Open menu">
            <Menu size={19} />
          </button>
          <div className="topbar-spacer" />
          <InstallButton />
          <NotificationBell />
          <div className="user-chip">
            <div className="avatar">{initials}</div>
            <div className="user-meta">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{ROLE_LABELS[user.role]}</div>
            </div>
          </div>
          <button className="icon-btn" onClick={() => { logout(); navigate('/login'); }} aria-label="Log out" title="Log out">
            <LogOut size={18} />
          </button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
