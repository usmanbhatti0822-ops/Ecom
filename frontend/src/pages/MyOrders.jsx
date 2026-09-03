import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then((res) => setOrders(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="container page">
      <h2>My orders</h2>
      {orders.length === 0 ? (
        <EmptyState title="No orders yet" subtitle="Once you place an order, it will show up here." action={<Link to="/products" className="btn btn-primary">Browse products</Link>} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="mono">#{o._id.slice(-8).toUpperCase()}</td>
                  <td>{new Date(o.order_date).toLocaleDateString()}</td>
                  <td>{o.items?.length || 0}</td>
                  <td className="price">${o.total_amount.toFixed(2)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>{o.payment && <StatusBadge status={o.payment.payment_status} />}</td>
                  <td><Link to={`/my-orders/${o._id}`}>View →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
