import './Navbar.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(search.trim() ? `/products?search=${encodeURIComponent(search.trim())}` : '/products');
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">Meridian</Link>

        <form className="navbar-search" onSubmit={submitSearch}>
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/products" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/categories" onClick={() => setMenuOpen(false)}>Categories</Link>
          <Link to="/cart" className="navbar-cart" onClick={() => setMenuOpen(false)}>
            Cart {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
          {user ? (
            <div className="navbar-user">
              <Link to="/my-orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
              <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/'); setMenuOpen(false); }}>Sign out</button>
            </div>
          ) : (
            <div className="navbar-user">
              <Link to="/login" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/register" className="btn btn-accent btn-sm" onClick={() => setMenuOpen(false)}>Sign up</Link>
            </div>
          )}
        </nav>

        <button className="navbar-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">☰</button>
      </div>
    </header>
  );
}
