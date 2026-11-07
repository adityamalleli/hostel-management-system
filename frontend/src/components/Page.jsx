// Consistent page heading used by every route
const Page = ({ title, subtitle, actions, children }) => (
  <div>
    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions}
    </div>
    {children}
  </div>
);

export default Page;
