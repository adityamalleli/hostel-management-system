import { useEffect, useState } from 'react';
import api from '../api/axios';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['breakfast', 'lunch', 'snacks', 'dinner'];

const MessMenuEditor = () => {
  const [menuByDay, setMenuByDay] = useState({});
  const [editingDay, setEditingDay] = useState(DAYS[0]);
  const [draft, setDraft] = useState({ breakfast: '', lunch: '', snacks: '', dinner: '' });
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/mess');
      const map = {};
      res.data.menu.forEach((m) => { map[m.day] = m; });
      setMenuByDay(map);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load menu');
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const existing = menuByDay[editingDay];
    setDraft({
      breakfast: existing?.breakfast || '',
      lunch: existing?.lunch || '',
      snacks: existing?.snacks || '',
      dinner: existing?.dinner || '',
    });
    setSaved(false);
  }, [editingDay, menuByDay]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/mess/${editingDay}`, draft);
      setSaved(true);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save menu');
    }
  };

  return (
    <div className="card">
      <h2>Edit weekly mess menu</h2>
      {error && <div className="error-text">{error}</div>}
      {saved && <div className="success-text">Saved {editingDay}'s menu.</div>}

      <div className="tabs">
        {DAYS.map((d) => (
          <button
            key={d}
            type="button"
            className={`tab-btn ${editingDay === d ? 'active' : ''}`}
            onClick={() => setEditingDay(d)}
          >
            {d.slice(0, 3)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave}>
        {MEALS.map((meal) => (
          <div key={meal}>
            <label style={{ textTransform: 'capitalize' }}>{meal}</label>
            <input
              value={draft[meal]}
              onChange={(e) => setDraft({ ...draft, [meal]: e.target.value })}
              placeholder={`What's for ${meal}?`}
            />
          </div>
        ))}
        <button className="btn" type="submit">Save {editingDay}</button>
      </form>
    </div>
  );
};

export default MessMenuEditor;
