const StatCard = ({ icon: Icon, label, value, sub, tone = 'teal' }) => (
  <div className="card stat">
    <div className={`stat-icon ${tone}`}>{Icon && <Icon size={22} />}</div>
    <div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

export default StatCard;
