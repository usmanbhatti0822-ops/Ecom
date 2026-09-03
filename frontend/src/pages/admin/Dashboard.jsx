import { useEffect, useState } from 'react';
import api from '../../api/client';
import Loader from '../../components/Loader';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setStats(res.data.data));
  }, []);

  if (!stats) return <Loader />;

  const cards = [
    { label: 'Total Orders', value: stats.totalOrders },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}` },
    { label: 'Total Products', value: stats.totalProducts },
    { label: 'Total Users', value: stats.totalUsers },
    { label: 'Pending Orders', value: stats.pendingOrders },
    { label: 'Low Stock Products', value: stats.lowStockProducts }
  ];

  return (
    <div>
      <h3>Overview</h3>
      <div className="stat-grid">
        {cards.map((c) => (
          <div className="stat-card" key={c.label}>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
