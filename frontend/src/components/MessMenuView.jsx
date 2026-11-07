import { useEffect, useState } from 'react';
import api from '../api/axios';

const MessMenuView = () => {
  const [menu, setMenu] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/mess')
      .then((res) => setMenu(res.data.menu))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load menu'));
  }, []);

  return (
    <div className="card">
      <h2>Weekly mess menu</h2>
      {error && <div className="error-text">{error}</div>}
      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>Breakfast</th>
            <th>Lunch</th>
            <th>Snacks</th>
            <th>Dinner</th>
          </tr>
        </thead>
        <tbody>
          {menu.map((m) => (
            <tr key={m.day}>
              <td>{m.day}</td>
              <td>{m.breakfast || '—'}</td>
              <td>{m.lunch || '—'}</td>
              <td>{m.snacks || '—'}</td>
              <td>{m.dinner || '—'}</td>
            </tr>
          ))}
          {menu.length === 0 && (
            <tr><td colSpan={5} className="muted">Menu hasn't been set yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MessMenuView;
