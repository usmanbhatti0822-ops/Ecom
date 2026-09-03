import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!order) return <div className="container page"><h2>Order not found</h2></div>;

  return (
    <div className="container page" style={{ maxWidth: 640 }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.4rem', marginBottom: 6 }}>✓</div>
        <h2>Order confirmed</h2>
        <p>Thanks — your order has been placed successfully.</p>
        <div className="mono" style={{ background: 'var(--surface-sunken)', padding: '10px 16px', borderRadius: 'var(--radius-md)', display: 'inline-block', margin: '12px 0' }}>
          Order #{order._id.slice(-8).toUpperCase()}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
          <StatusBadge status={order.status} />
          {order.payment && <StatusBadge status={order.payment.payment_status} />}
        </div>
        <p className="price" style={{ fontSize: '1.3rem' }}>${order.total_amount.toFixed(2)}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
          <Link to={`/my-orders/${order._id}`} className="btn btn-primary">View order details</Link>
          <Link to="/products" className="btn btn-outline">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
