import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="auth-panel" style={{ minHeight: '100vh' }}>
    <div className="card" style={{ textAlign: 'center', maxWidth: 420 }}>
      <h1>Page not found</h1>
      <p className="muted">That page doesn't exist or you don't have access to it.</p>
      <Link to="/" className="btn">Go home</Link>
    </div>
  </div>
);

export default NotFound;
