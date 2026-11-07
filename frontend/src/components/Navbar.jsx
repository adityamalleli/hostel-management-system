import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  admin: 'Admin / Warden',
  student: 'Student',
  mess_staff: 'Mess Staff',
  parent: 'Parent',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="navbar">
      <div className="brand">Hostel Management System</div>
      {user && (
        <div className="nav-right">
          <span>
            {user.name} <span className="muted">· {ROLE_LABELS[user.role]}</span>
          </span>
          <button className="btn secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
