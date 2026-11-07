import { useCallback, useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Maximize2, Clock, UserCheck } from 'lucide-react';
import api from '../../api/axios';

const QrSession = () => {
  const [cfg, setCfg] = useState(null);
  const [token, setToken] = useState('');
  const [progress, setProgress] = useState(0);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const issuedAt = useRef(Date.now());
  const refreshMs = useRef(30000);
  const frameRef = useRef(null);
  const today = new Date().toISOString().slice(0, 10);

  const fetchToken = useCallback(async () => {
    try {
      const res = await api.get('/attendance/qr/token');
      setToken(res.data.token);
      issuedAt.current = Date.now();
      // refresh 10 seconds before the old token expires so scans never hit a dead code
      refreshMs.current = Math.max(8000, (res.data.expiresInSeconds - 10) * 1000);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not generate QR code');
    }
  }, []);

  useEffect(() => {
    api.get('/attendance/config').then((r) => setCfg(r.data)).catch(() => {});
    fetchToken();
  }, [fetchToken]);

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Date.now() - issuedAt.current;
      setProgress(Math.min(100, (elapsed / refreshMs.current) * 100));
      if (elapsed >= refreshMs.current) fetchToken();
    }, 250);
    return () => clearInterval(id);
  }, [fetchToken]);

  useEffect(() => {
    const load = () => api.get(`/attendance/date/${today}`).then((r) => setRecords(r.data.records)).catch(() => {});
    load();
    const id = setInterval(load, 5000); // live feed of check-ins
    return () => clearInterval(id);
  }, [today]);

  const present = records.filter((r) => r.status === 'present').length;
  const late = records.filter((r) => r.status === 'late').length;
  const recent = records.filter((r) => r.checkInTime && r.method !== 'auto').slice(0, 8);
  const secondsLeft = Math.max(0, Math.ceil(((100 - progress) / 100) * (refreshMs.current / 1000)));

  return (
    <div className="qr-stage">
      <div className="qr-frame" ref={frameRef}>
        {error && <div className="error-text">{error}</div>}
        {token ? <QRCodeSVG value={token} size={320} level="M" includeMargin /> : <div className="empty">Generating code…</div>}
        <div className="progress mt-16"><span style={{ width: `${100 - progress}%` }} /></div>
        <p className="muted mt-8">New code in {secondsLeft}s · students scan this from their app</p>
        <button className="btn secondary mt-8" onClick={() => frameRef.current?.requestFullscreen?.()}>
          <Maximize2 size={16} /> Fullscreen for projector
        </button>
      </div>

      <div>
        <div className="grid grid-3">
          <div className="card"><div className="stat-label">Present</div><div className="stat-value">{present}</div></div>
          <div className="card"><div className="stat-label">Late</div><div className="stat-value">{late}</div></div>
          <div className="card"><div className="stat-label">Checked in</div><div className="stat-value">{records.filter((r) => r.method !== 'auto').length}</div></div>
        </div>

        <div className="card mt-16">
          <h2><Clock size={16} style={{ verticalAlign: '-2px' }} /> Check-in window</h2>
          {cfg ? (
            <p className="muted" style={{ margin: 0 }}>
              Open <b>{cfg.window.start}–{cfg.window.end}</b>. Scans before <b>{cfg.window.lateAfter}</b> count as present, after that as late.
              Anyone with no scan when the window closes is marked absent automatically.
              {!cfg.requireQr && <> <b>Note:</b> button check-in is also enabled right now.</>}
            </p>
          ) : <p className="muted">Loading…</p>}
        </div>

        <div className="card">
          <h2><UserCheck size={16} style={{ verticalAlign: '-2px' }} /> Live check-ins</h2>
          {recent.length === 0 ? <div className="empty">Waiting for the first scan…</div> : (
            <table>
              <thead><tr><th>Student</th><th>Room</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r._id}>
                    <td>{r.student?.name} <div className="muted">{r.student?.rollNumber}</div></td>
                    <td>{r.student?.room?.roomNumber || '—'}</td>
                    <td>{new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                    <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrSession;
