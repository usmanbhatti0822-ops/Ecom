import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';

export default function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancelOrder = async () => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this order?'
    );

    if (!confirmCancel) return;

    try {
      setCancelling(true);
      setMessage('');

      const res = await api.patch(`/orders/${id}/cancel`);

      setOrder((prevOrder) => ({
        ...prevOrder,
        status: res.data.data.order.status
      }));

      if (res.data.data.refund) {
        setMessage(
          'Order cancelled successfully. Your refund request has been created.'
        );
      } else {
        setMessage('Order cancelled successfully.');
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'Unable to cancel this order.'
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Loader />;

  if (!order) {
    return (
      <div className="container page">
        <h2>Order not found</h2>
      </div>
    );
  }

  const payment = order.payment;

  // Customer sirf pending aur confirmed order cancel kar sakta hai
  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <div className="container page">
      <Link to="/my-orders">← Back to my orders</Link>

      <div
        className="section-title-row"
        style={{
          marginTop: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h2 className="mono">
          Order #{order._id.slice(-8).toUpperCase()}
        </h2>

        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center'
          }}
        >
          <StatusBadge status={order.status} />

          {canCancel && (
            <button
              className="btn btn-danger"
              onClick={handleCancelOrder}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      {message && (
        <p
          className="text-soft"
          style={{ marginBottom: 20 }}
        >
          {message}
        </p>
      )}

      <div className="order-detail-grid">
        <div>
          <div
            className="card"
            style={{ marginBottom: 20 }}
          >
            <h3>Items</h3>

            {order.items.map((item) => (
              <div
                key={item._id}
                className="summary-row"
              >
                <span>
                  {item.product?.name || 'Product removed'} ×{' '}
                  {item.quantity}

                  <span className="text-soft">
                    {' '}
                    (price at purchase: $
                    {item.price.toFixed(2)})
                  </span>
                </span>

                <span className="price">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            <div className="summary-row summary-total">
              <span>Total</span>

              <span className="price">
                ${order.total_amount.toFixed(2)}
              </span>
            </div>
          </div>

          {payment && (
            <div className="card">
              <h3>Payment status history</h3>

              {payment.statusHistory?.map((h) => (
                <div
                  key={h._id}
                  className="summary-row"
                  style={{ alignItems: 'flex-start' }}
                >
                  <div>
                    <StatusBadge status={h.status} />

                    {h.note && (
                      <div
                        className="text-soft"
                        style={{
                          fontSize: '.82rem',
                          marginTop: 4
                        }}
                      >
                        {h.note}
                      </div>
                    )}
                  </div>

                  <span
                    className="text-soft"
                    style={{ fontSize: '.8rem' }}
                  >
                    {new Date(
                      h.changed_at
                    ).toLocaleString()}
                  </span>
                </div>
              ))}

              {payment.refunds?.length > 0 && (
                <>
                  <h3 style={{ marginTop: 20 }}>
                    Refunds
                  </h3>

                  {payment.refunds.map((r) => (
                    <div
                      key={r._id}
                      className="summary-row"
                    >
                      <span>
                        {r.reason || 'Refund'}{' '}
                        <StatusBadge
                          status={r.refund_status}
                        />
                      </span>

                      <span className="price">
                        ${r.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h3>Order info</h3>

          <div className="summary-row">
            <span>Order date</span>

            <span>
              {new Date(
                order.order_date
              ).toLocaleString()}
            </span>
          </div>

          <div className="summary-row">
            <span>Customer</span>

            <span>{order.user?.name}</span>
          </div>

          <div className="summary-row">
            <span>Shipping address</span>

            <span
              style={{
                textAlign: 'right',
                maxWidth: 180
              }}
            >
              {order.shipping_address}
            </span>
          </div>

          {payment && (
            <>
              <h3 style={{ marginTop: 20 }}>
                Payment
              </h3>

              <div className="summary-row">
                <span>Method</span>

                <span>
                  {payment.payment_method?.toUpperCase()}
                </span>
              </div>

              <div className="summary-row">
                <span>Status</span>

                <StatusBadge
                  status={payment.payment_status}
                />
              </div>

              {payment.transaction_id && (
                <div className="summary-row">
                  <span>Transaction ID</span>

                  <span className="mono">
                    {payment.transaction_id}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}