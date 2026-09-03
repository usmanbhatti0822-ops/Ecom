import { useEffect, useState } from 'react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader';

export default function UsersManage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/users').then((res) => setUsers(res.data.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const toggleRole = async (u) => {
    const newRole = u.role === 'admin' ? 'customer' : 'admin';
    try {
      await api.put(`/users/${u._id}/role`, { role: newRole });
      showToast(`${u.name} is now ${newRole}`, 'success');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h3>Users</h3>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'badge-confirmed' : 'badge-pending'}`}>{u.role}</span></td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td><button className="btn btn-outline btn-sm" onClick={() => toggleRole(u)}>Make {u.role === 'admin' ? 'customer' : 'admin'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
