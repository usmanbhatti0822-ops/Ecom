import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';

export default function Profile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { name };
      if (password) payload.password = password;
      await api.put('/users/profile', payload);
      showToast('Profile updated', 'success');
      setPassword('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page">
      <div className="card auth-card">
        <h2>Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input value={user?.email || ''} disabled />
          </div>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="password">New password</label>
            <input id="password" type="password" placeholder="Leave blank to keep current password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
