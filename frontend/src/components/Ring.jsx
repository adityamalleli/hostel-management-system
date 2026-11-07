// Circular progress ring used for attendance percentages
const Ring = ({ percent = 0, size = 132, stroke = 12, label = 'attendance' }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, percent));
  const color = pct >= 75 ? '#008591' : pct >= 50 ? '#e8a838' : '#d64545';
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f6" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="ring-label"><b>{Math.round(pct)}%</b><span className="muted">{label}</span></div>
    </div>
  );
};

export default Ring;
