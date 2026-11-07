import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, CalendarCheck, Info } from 'lucide-react';
import api from '../api/axios';

const ICONS = { complaint: MessageSquare, attendance: CalendarCheck, system: Info };

const timeAgo = (iso) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} d ago`;
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setItems(res.data.notifications);
      setUnread(res.data.unreadCount);
    } catch {
      /* ignore transient errors */
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000); // light polling keeps the badge fresh
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleClick = async (n) => {
    if (!n.read) await api.put(`/notifications/${n._id}/read`).catch(() => {});
    setOpen(false);
    load();
    if (n.link) navigate(n.link);
  };

  const markAll = async () => {
    await api.put('/notifications/read-all').catch(() => {});
    load();
  };

  return (
    <div className="notif-wrap" ref={ref}>
      <button className="icon-btn" onClick={() => { setOpen(!open); if (!open) load(); }} aria-label="Notifications">
        <Bell size={19} />
        {unread > 0 && <span className="dot-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-head">
            <span>Notifications</span>
            {unread > 0 && <button className="link-btn" onClick={markAll}>Mark all read</button>}
          </div>
          <div className="notif-list">
            {items.length === 0 && <div className="notif-empty">You're all caught up.</div>}
            {items.map((n) => {
              const Icon = ICONS[n.type] || Info;
              return (
                <div key={n._id} className={`notif-item ${n.read ? '' : 'unread'}`} onClick={() => handleClick(n)}>
                  <div className="notif-icon"><Icon size={16} /></div>
                  <div>
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-msg">{n.message}</div>
                    <div className="notif-time">{timeAgo(n.createdAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
