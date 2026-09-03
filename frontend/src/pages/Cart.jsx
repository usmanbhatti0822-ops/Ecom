import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import QuantityStepper from '../components/QuantityStepper';
import EmptyState from '../components/EmptyState';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container page">
        <EmptyState
          title="Your cart is empty"
          subtitle="Browse products and add something you like."
          action={<Link to="/products" className="btn btn-primary">Browse products</Link>}
        />
      </div>
    );
  }

  const goToCheckout = () => {
    if (!user) { navigate('/login', { state: { from: { pathname: '/checkout' } } }); return; }
    navigate('/checkout');
  };

  return (
    <div className="container page">
      <h2>Your cart</h2>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map(({ product, quantity }) => (
            <div className="cart-row card" key={product._id}>
              <img src={product.image_url} alt={product.name} className="cart-row-img" />
              <div style={{ flex: 1 }}>
                <Link to={`/products/${product._id}`} style={{ fontWeight: 600, color: 'var(--ink)' }}>{product.name}</Link>
                <div className="text-soft mono" style={{ fontSize: '.85rem' }}>${product.price.toFixed(2)} each</div>
              </div>
              <QuantityStepper value={quantity} onChange={(q) => updateQuantity(product._id, q)} max={product.stock} />
              <div className="price" style={{ width: 80, textAlign: 'right' }}>${(product.price * quantity).toFixed(2)}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => removeItem(product._id)}>Remove</button>
            </div>
          ))}
        </div>

        <div className="card cart-summary">
          <h3>Order summary</h3>
          <div className="summary-row"><span>Subtotal</span><span className="price">${subtotal.toFixed(2)}</span></div>
          <div className="summary-row text-soft"><span>Shipping</span><span>Calculated at checkout</span></div>
          <div className="summary-row summary-total"><span>Total</span><span className="price">${subtotal.toFixed(2)}</span></div>
          <button className="btn btn-accent btn-block" onClick={goToCheckout}>Proceed to checkout</button>
        </div>
      </div>
    </div>
  );
}
