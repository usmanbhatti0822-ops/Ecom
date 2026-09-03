import { useEffect, useState } from 'react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader';
import StatusBadge from '../../components/StatusBadge';

export default function RefundsManage() {
  const { showToast } = useToast();
  const [refunds, setRefunds] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ payment_id: '', amount: '', reason: '' });

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/refunds'),
      api.get('/orders?all=true')
    ]).then(([r, o]) => {
      setRefunds(r.data.data);
      setOrders(o.data.data.filter((ord) => ord.payment && ord.payment.payment_status === 'paid'));
    }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/refunds', { ...form, amount: Number(form.amount) });
      showToast('Refund requested', 'success');
      setModalOpen(false);
      setForm({ payment_id: '', amount: '', reason: '' });
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Request failed', 'error');
    }
  };

  const updateStatus = async (refund, status) => {
    try {
      await api.put(`/refunds/${refund._id}`, { refund_status: status });
      showToast('Refund updated', 'success');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="admin-toolbar">
        <h3 style={{ margin: 0 }}>Refunds</h3>
        <button className="btn btn-accent" onClick={() => setModalOpen(true)}>+ Request refund</button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Payment</th><th>Amount</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {refunds.map((r) => (
              <tr key={r._id}>
                <td className="mono">{r.payment?._id?.slice(-8).toUpperCase()}</td>
                <td className="price">${r.amount.toFixed(2)}</td>
                <td>{r.reason}</td>
                <td><StatusBadge status={r.refund_status} /></td>
                <td>
                  {r.refund_status === 'pending' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => updateStatus(r, 'completed')}>Complete</button>
                      <button className="btn btn-danger btn-sm" onClick={() => updateStatus(r, 'failed')}>Fail</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Request refund</h3>
            <form onSubmit={handleCreate}>
              <div className="field">
                <label>Order / Payment</label>
                <select required value={form.payment_id} onChange={(e) => {
                  const order = orders.find((o) => o.payment._id === e.target.value);
                  setForm({ ...form, payment_id: e.target.value, amount: order ? order.payment.amount : '' });
                }}>
                  <option value="">Select a paid order…</option>
                  {orders.map((o) => (
                    <option key={o.payment._id} value={o.payment._id}>
                      #{o._id.slice(-8).toUpperCase()} — ${o.payment.amount.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field"><label>Amount</label><input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              <div className="field"><label>Reason</label><textarea rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
