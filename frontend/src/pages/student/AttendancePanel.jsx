import { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ScanLine, CheckCircle2, Clock, Keyboard } from 'lucide-react';
import api from '../../api/axios';
import Ring from '../../components/Ring';

const AttendancePanel = () => {
  const [records, setRecords] = useState([]);
  const [cfg, setCfg] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState(false);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/attendance/me').then((r) => setRecords(r.data.records)).catch(() => {});

  useEffect(() => {
    load();
    api.get('/attendance/config').then((r) => setCfg(r.data)).catch(() => {});
  }, []);

  const submitToken = async (token) => {
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const res = await api.post('/attendance/qr/scan', { token: token.trim() });
      setMessage(res.data.message);
      setCode('');
      setManual(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed');
    } finally {
      setBusy(false);
    }
  };

  const buttonCheckIn = async () => {
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const res = await api.post('/attendance/checkin');
      setMessage(res.data.message);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed');
    } finally {
      setBusy(false);
    }
  };

  // Start / stop the camera whenever `scanning` flips
  useEffect(() => {
    if (!scanning) return undefined;
    const scanner = new Html5Qrcode('qr-reader');
    let handled = false;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (text) => {
          if (handled) return;
          handled = true;
          scanner.stop().catch(() => {}).finally(() => {
            setScanning(false);
            submitToken(text);
          });
        },
        () => {}
      )
      .catch(() => {
        setError('Could not open the camera. Allow camera access (the site must use HTTPS on phones) or paste the code instead.');
        setScanning(false);
        setManual(true);
      });

    return () => {
      if (!handled) scanner.stop().then(() => scanner.clear()).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecord = records.find((r) => r.date === todayStr);
  const attended = records.filter((r) => r.status === 'present' || r.status === 'late').length;
  const pct = records.length ? (attended / records.length) * 100 : 0;

  return (
    <div>
      <div className="grid grid-2">
        <div className="card">
          <h2>Today's check-in</h2>
          {error && <div className="error-text">{error}</div>}
          {message && <div className="success-text">{message}</div>}

          {todayRecord ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <CheckCircle2 size={34} color="#17855a" />
              <div>
                <div style={{ fontWeight: 650 }}>You're checked in <span className={`badge ${todayRecord.status}`}>{todayRecord.status}</span></div>
                {todayRecord.checkInTime && <div className="muted">at {new Date(todayRecord.checkInTime).toLocaleTimeString()}</div>}
              </div>
            </div>
          ) : (
            <>
              {cfg && (
                <p className="muted" style={{ marginTop: 0 }}>
                  <Clock size={14} style={{ verticalAlign: '-2px' }} /> Window {cfg.window.start}–{cfg.window.end} · late after {cfg.window.lateAfter}
                </p>
              )}
              {!scanning && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn lg" onClick={() => { setError(''); setMessage(''); setScanning(true); }} disabled={busy}>
                    <ScanLine size={18} /> Scan QR code
                  </button>
                  {cfg && !cfg.requireQr && (
                    <button className="btn secondary lg" onClick={buttonCheckIn} disabled={busy}>Check in with button</button>
                  )}
                </div>
              )}
              {scanning && (
                <div>
                  <div id="qr-reader" />
                  <button className="btn secondary mt-16" onClick={() => setScanning(false)}>Cancel</button>
                </div>
              )}
              {!scanning && (
                <div className="mt-16">
                  <button className="link-btn" onClick={() => setManual(!manual)}>
                    <Keyboard size={14} style={{ verticalAlign: '-2px' }} /> Camera not working? Paste the code
                  </button>
                  {manual && (
                    <div className="mt-8">
                      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste the code from the warden's screen" />
                      <button className="btn" onClick={() => submitToken(code)} disabled={!code.trim() || busy}>Submit code</button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <Ring percent={pct} />
          <div>
            <h2 style={{ marginBottom: 6 }}>Overall attendance</h2>
            <p className="muted" style={{ margin: 0 }}>{attended} present or late out of {records.length} recorded days.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>My attendance history</h2>
        <table>
          <thead><tr><th>Date</th><th>Status</th><th>Method</th><th>Check-in time</th></tr></thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td>{r.date}</td>
                <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                <td>{r.method ? <span className={`badge ${r.method === 'qr' ? 'qr' : 'neutral'}`}>{r.method}</span> : '—'}</td>
                <td>{r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '—'}</td>
              </tr>
            ))}
            {records.length === 0 && <tr><td colSpan={4} className="empty">No attendance records yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendancePanel;
