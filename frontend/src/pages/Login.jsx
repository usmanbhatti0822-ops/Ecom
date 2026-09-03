import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      showToast('Welcome back!', 'success');
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setErrors({ form: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page">
      <div className="card auth-card">
        <h2>Sign in</h2>
        {errors.form && <p style={{ color: 'var(--danger)' }}>{errors.form}</p>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required value={form.password} onChange={handleChange} />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: 'center' }}>
          New here? <Link to="/register">Create an account</Link>
        </p>
        <p className="text-soft" style={{ fontSize: '.78rem', textAlign: 'center' }}>
          Demo admin: admin@example.com / Admin@123<br />
          Demo customer: customer@example.com / Customer@123
        </p>
      </div>
    </div>
  );
}
