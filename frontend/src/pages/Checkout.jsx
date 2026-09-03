import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const METHODS = [
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'card', label: 'Credit / Debit Card' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'jazzcash', label: 'JazzCash' },
  { value: 'easypaisa', label: 'Easypaisa' }
];

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [method, setMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!address.trim()) { setError('Shipping address is required'); return; }
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({ product_id: i.product._id, quantity: i.quantity })),
        shipping_address: address,
        payment_method: method
      };
      const res = await api.post('/orders', payload);
      const order = res.data.data;

      // Process the payment (demo/mock gateway) right after order creation
      try { await api.post(`/payments/order/${order._id}/process`); } catch { /* order still exists, shown in confirmation */ }

      clearCart();
      showToast('Order placed successfully!', 'success');
      navigate(`/order-confirmation/${order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page">
      <h2>Checkout</h2>
      <form onSubmit={placeOrder} className="cart-layout">
        <div className="cart-items">
          <div className="card" style={{ marginBottom: 20 }}>
            <h3>Customer information</h3>
            <div className="field">
              <label htmlFor="address">Shipping address</label>
              <textarea id="address" rows={3} required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, city, postal code, country" />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3>Payment method</h3>
            {METHODS.map((m) => (
              <label key={m.value} className="payment-option">
                <input type="radio" name="method" value={m.value} checked={method === m.value} onChange={() => setMethod(m.value)} />
                {m.label}
              </label>
            ))}
            <p className="hint" style={{ marginTop: 10 }}>
              This is a demo checkout — no real payment gateway credentials are used. Card/Stripe/JazzCash/Easypaisa
              payments are simulated for demonstration purposes.
            </p>
          </div>

          <div className="card">
            <h3>Order items</h3>
            {items.map(({ product, quantity }) => (
              <div key={product._id} className="summary-row">
                <span>{product.name} × {quantity}</span>
                <span className="price">${(product.price * quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card cart-summary">
          <h3>Order summary</h3>
          <div className="summary-row"><span>Subtotal</span><span className="price">${subtotal.toFixed(2)}</span></div>
          <div className="summary-row summary-total"><span>Total</span><span className="price">${subtotal.toFixed(2)}</span></div>
          {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
          <button className="btn btn-accent btn-block" type="submit" disabled={submitting}>
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
        </div>
      </form>
    </div>
  );
}
