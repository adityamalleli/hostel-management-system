import { useEffect, useState } from 'react';
import api from '../api/axios';

// A small search-as-you-type picker for selecting a student.
// Calls onSelect(student) when the user picks one from the dropdown.
const StudentPicker = ({ onSelect, placeholder = 'Search by name or roll number...' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      api
        .get('/users', { params: { role: 'student', search: query } })
        .then((res) => setResults(res.data.users))
        .catch(() => setResults([]));
    }, 300); // debounce

    return () => clearTimeout(handle);
  }, [query]);

  const handlePick = (student) => {
    onSelect(student);
    setQuery(`${student.name} (${student.rollNumber || 'no roll no.'})`);
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        style={{ margin: 0 }}
      />
      {open && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 8,
            marginTop: 4,
            maxHeight: 180,
            overflowY: 'auto',
            zIndex: 10,
          }}
        >
          {results.map((s) => (
            <div
              key={s._id}
              onClick={() => handlePick(s)}
              style={{ padding: '8px 10px', cursor: 'pointer', fontSize: '0.9rem' }}
              onMouseDown={(e) => e.preventDefault()}
            >
              {s.name} <span className="muted">· {s.rollNumber || 'no roll no.'} · {s.room ? 'has room' : 'unallocated'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentPicker;
