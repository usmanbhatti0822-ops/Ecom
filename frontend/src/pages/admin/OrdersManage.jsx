import { useEffect, useState } from 'react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader';
import StatusBadge from '../../components/StatusBadge';

const NEXT_STATUS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: []
};

export default function OrdersManage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    const q = filter ? `&status=${filter}` : '';
    api.get(`/orders?all=true${q}`).then((res) => setOrders(res.data.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filter]);

  const changeStatus = async (order, status) => {
    try {
      await api.put(`/orders/${order._id}/status`, { status });
      showToast('Order status updated', 'success');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="admin-toolbar">
        <h3 style={{ margin: 0 }}>Orders</h3>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 200 }}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Payment</th><th>Update status</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td className="mono">#{o._id.slice(-8).toUpperCase()}</td>
                <td>{o.user?.name}<br /><span className="text-soft" style={{ fontSize: '.78rem' }}>{o.user?.email}</span></td>
                <td className="price">${o.total_amount.toFixed(2)}</td>
                <td><StatusBadge status={o.status} /></td>
                <td>{o.payment && <StatusBadge status={o.payment.payment_status} />}</td>
                <td>
                  {NEXT_STATUS[o.status]?.length > 0 ? (
                    <select defaultValue="" onChange={(e) => { if (e.target.value) changeStatus(o, e.target.value); }}>
                      <option value="">Change to…</option>
                      {NEXT_STATUS[o.status].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : <span className="text-soft">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
