import { useEffect, useState } from 'react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader';
import ConfirmDialog from '../../components/ConfirmDialog';

const emptyForm = { name: '', description: '', price: '', stock: '', image_url: '', category: '' };

export default function ProductsManage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/products?limit=100'), api.get('/categories')])
      .then(([p, c]) => { setProducts(p.data.data); setCategories(c.data.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, image_url: p.image_url, category: p.category?._id || p.category });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editing) {
        await api.put(`/products/${editing._id}`, payload);
        showToast('Product updated', 'success');
      } else {
        await api.post('/products', payload);
        showToast('Product created', 'success');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${deleteTarget._id}`);
      showToast('Product deleted', 'success');
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
        <h3 style={{ margin: 0 }}>Products</h3>
        <button className="btn btn-accent" onClick={openCreate}>+ New product</button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.category?.name}</td>
                <td className="price">${p.price.toFixed(2)}</td>
                <td>{p.stock}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? 'Edit product' : 'New product'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="field"><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label>Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="form-row">
                <div className="field"><label>Price</label><input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                <div className="field"><label>Stock</label><input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
              </div>
              <div className="field">
                <label>Category</label>
                <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select…</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="field"><label>Image URL</label><input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
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
        title="Delete product"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
