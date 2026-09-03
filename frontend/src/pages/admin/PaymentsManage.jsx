import { useEffect, useState } from 'react';
import api from '../../api/client';
import Loader from '../../components/Loader';
import StatusBadge from '../../components/StatusBadge';

export default function PaymentsManage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [history, setHistory] = useState({});

  useEffect(() => {
    api.get('/orders?all=true').then((res) => setOrders(res.data.data.filter((o) => o.payment))).finally(() => setLoading(false));
  }, []);

  const toggle = async (order) => {
    if (expanded === order._id) { setExpanded(null); return; }
    setExpanded(order._id);
    if (!history[order.payment._id]) {
      const res = await api.get(`/payments/${order.payment._id}/history`);
      setHistory((prev) => ({ ...prev, [order.payment._id]: res.data.data }));
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h3>Payments</h3>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Order</th><th>Method</th><th>Amount</th><th>Status</th><th>Transaction ID</th><th></th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <>
                <tr key={o._id}>
                  <td className="mono">#{o._id.slice(-8).toUpperCase()}</td>
                  <td>{o.payment.payment_method?.toUpperCase()}</td>
                  <td className="price">${o.payment.amount.toFixed(2)}</td>
                  <td><StatusBadge status={o.payment.payment_status} /></td>
                  <td className="mono" style={{ fontSize: '.78rem' }}>{o.payment.transaction_id || '—'}</td>
                  <td><button className="btn btn-outline btn-sm" onClick={() => toggle(o)}>{expanded === o._id ? 'Hide' : 'History'}</button></td>
                </tr>
                {expanded === o._id && (
                  <tr>
                    <td colSpan={6} style={{ background: 'var(--surface-sunken)' }}>
                      {(history[o.payment._id] || []).map((h) => (
                        <div key={h._id} className="summary-row">
                          <span><StatusBadge status={h.status} /> {h.note}</span>
                          <span className="text-soft" style={{ fontSize: '.8rem' }}>{new Date(h.changed_at).toLocaleString()}</span>
                        </div>
                      ))}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
