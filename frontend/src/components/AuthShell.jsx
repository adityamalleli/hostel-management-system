import { Building2, QrCode, BarChart3, Bell, ShieldCheck } from 'lucide-react';

const FEATURES = [
  { icon: QrCode, text: 'Proxy-proof attendance with a rotating QR code' },
  { icon: BarChart3, text: 'Live occupancy, complaint and attendance analytics' },
  { icon: Bell, text: 'Instant in-app updates on every complaint' },
  { icon: ShieldCheck, text: 'Secure role-based access for four user types' },
];

const AuthShell = ({ children }) => (
  <div className="auth-split">
    <section className="auth-hero">
      <div>
        <div className="brand" style={{ padding: 0 }}>
          <div className="brand-mark"><Building2 size={20} /></div>
          <div>
            <div className="brand-name">Hostel Manager</div>
            <div className="brand-sub">Chaitanya Bharathi Institute of Technology</div>
          </div>
        </div>
        <h1>One platform for everything your hostel runs on.</h1>
        <p>Rooms, complaints, mess menus and attendance, managed in one place for wardens, students, mess staff and parents.</p>
        <ul className="feature-list">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text}><span className="f-icon"><Icon size={18} /></span>{text}</li>
          ))}
        </ul>
      </div>
      <div className="auth-foot">MCA Mini Project · Academic Year 2026–2027</div>
    </section>
    <section className="auth-panel">
      <div className="auth-form">{children}</div>
    </section>
  </div>
);

export default AuthShell;
