import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', phone: '', rollNumber: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <h1>Create your account</h1>
      <p className="muted">Pick your role to get the right workspace.</p>
      <div className="card">
        {error && <div className="error-text">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label>Full name</label>
          <input value={form.name} onChange={update('name')} required />
          <label>Email</label>
          <input type="email" value={form.email} onChange={update('email')} required />
          <div className="form-row">
            <div>
              <label>Password</label>
              <input type="password" value={form.password} onChange={update('password')} required minLength={6} />
            </div>
            <div>
              <label>Role</label>
              <select value={form.role} onChange={update('role')}>
                <option value="student">Student</option>
                <option value="admin">Admin / Warden</option>
                <option value="mess_staff">Mess Staff</option>
                <option value="parent">Parent</option>
              </select>
            </div>
          </div>
          {form.role === 'student' && (
            <>
              <label>Roll number</label>
              <input value={form.rollNumber} onChange={update('rollNumber')} />
            </>
          )}
          <label>Phone (optional)</label>
          <input value={form.phone} onChange={update('phone')} />
          <button className="btn lg" type="submit" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
      <p className="muted mt-16" style={{ textAlign: 'center' }}>
        Already registered? <Link to="/login"><b>Sign in</b></Link>
      </p>
    </AuthShell>
  );
};

export default Register;
