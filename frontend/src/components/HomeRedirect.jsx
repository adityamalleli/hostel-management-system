import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROUTE_BY_ROLE = {
  admin: '/admin',
  student: '/student',
  mess_staff: '/mess-staff',
  parent: '/parent',
};

const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="page">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to={ROUTE_BY_ROLE[user.role] || '/login'} replace />;
};

export default HomeRedirect;
