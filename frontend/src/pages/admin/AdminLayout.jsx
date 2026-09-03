import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/refunds', label: 'Refunds' },
  { to: '/admin/users', label: 'Users' }
];

export default function AdminLayout() {
  return (
    <div className="container page">
      <h2>Admin</h2>
      <div className="admin-layout">
        <nav className="admin-nav card">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div><Outlet /></div>
      </div>
    </div>
  );
}
