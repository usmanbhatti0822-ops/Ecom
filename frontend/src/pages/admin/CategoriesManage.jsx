import { useEffect, useState } from 'react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function CategoriesManage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/categories').then((res) => setCategories(res.data.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '' }); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/categories/${editing._id}`, form);
        showToast('Category updated', 'success');
      } else {
        await api.post('/categories', form);
        showToast('Category created', 'success');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/categories/${deleteTarget._id}`);
      showToast('Category deleted', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
      setDeleteTarget(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="admin-toolbar">
        <h3 style={{ margin: 0 }}>Categories</h3>
        <button className="btn btn-accent" onClick={openCreate}>+ New category</button>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Description</th><th>Products</th><th></th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.description}</td>
                <td>{c.productCount}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(c)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? 'Edit category' : 'New category'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="field"><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label>Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Save changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete category"
        message={`Delete "${deleteTarget?.name}"? Categories with products cannot be deleted.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
