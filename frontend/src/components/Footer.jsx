import './Footer.css';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <div className="navbar-logo" style={{ marginBottom: 8 }}>Meridian</div>
          <p className="text-soft" style={{ maxWidth: 320 }}>A modern, no-nonsense place to shop. Built as a full-stack demo project.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/products">All products</Link><br />
          <Link to="/categories">Categories</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/my-orders">My orders</Link><br />
          <Link to="/profile">Profile</Link>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 20, paddingBottom: 20, borderTop: '1px solid var(--border)', color: 'var(--ink-faint)', fontSize: '.8rem' }}>
        © {new Date().getFullYear()} Meridian. Demo project — no real payments are processed.
      </div>
    </footer>
  );
}
