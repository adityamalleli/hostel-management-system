import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('hms_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const saveUser = (u) => {
    localStorage.setItem('hms_user', JSON.stringify(u));
    setUser(u);
  };

  // Re-fetch the full profile (room + ward are populated by /auth/me)
  const refreshUser = async () => {
    const res = await api.get('/auth/me');
    saveUser(res.data.user);
    return res.data.user;
  };

  useEffect(() => {
    const token = localStorage.getItem('hms_token');
    if (!token) {
      setLoading(false);
      return;
    }
    refreshUser()
      .catch(() => {
        localStorage.removeItem('hms_token');
        localStorage.removeItem('hms_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const authenticate = async (path, payload) => {
    const res = await api.post(path, payload);
    localStorage.setItem('hms_token', res.data.token);
    return refreshUser();
  };

  const login = (email, password) => authenticate('/auth/login', { email, password });
  const register = (payload) => authenticate('/auth/register', payload);

  const logout = () => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
