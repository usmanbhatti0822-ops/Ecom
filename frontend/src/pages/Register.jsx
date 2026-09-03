import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password, form.confirmPassword);
      showToast('Account created — welcome!', 'success');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setErrors({ form: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page">
      <div className="card auth-card">
        <h2>Create an account</h2>
        {errors.form && <p style={{ color: 'var(--danger)' }}>{errors.form}</p>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" required value={form.name} onChange={handleChange} />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required value={form.password} onChange={handleChange} />
            {errors.password && <div className="error-text">{errors.password}</div>}
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange} />
            {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: 'center' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
