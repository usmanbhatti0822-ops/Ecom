import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import Loader from '../components/Loader';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=8&sort=createdAt&order=desc'),
      api.get('/categories')
    ]).then(([p, c]) => {
      setProducts(p.data.data);
      setCategories(c.data.data.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <span className="hero-eyebrow">Everything, priced plainly</span>
            <h1>Shop things you'll<br />actually use.</h1>
            <p style={{ fontSize: '1.05rem', maxWidth: 460 }}>
              Meridian is a straightforward shop: real stock counts, honest prices, and a checkout
              that doesn't try to sell you anything else.
            </p>
            <Link to="/products" className="btn btn-accent" style={{ marginTop: 10 }}>Browse products</Link>
          </div>
          <div className="hero-ticket mono">
            <div className="hero-ticket-row"><span>ITEM</span><span>PRICE</span></div>
            <div className="hero-ticket-row"><span>Headphones</span><span>$89.99</span></div>
            <div className="hero-ticket-row"><span>Smart Watch</span><span>$129.99</span></div>
            <div className="hero-ticket-row"><span>Yoga Mat</span><span>$19.99</span></div>
            <div className="hero-ticket-divider" />
            <div className="hero-ticket-row hero-ticket-total"><span>NO SURPRISES</span><span>✓</span></div>
          </div>
        </div>
      </section>

      <div className="container page">
        {loading ? <Loader /> : (
          <>
            <div className="section-title-row">
              <h2>Shop by category</h2>
              <Link to="/categories">View all →</Link>
            </div>
            <div className="grid-categories" style={{ marginBottom: 56 }}>
              {categories.map((c) => <CategoryCard key={c._id} category={c} />)}
            </div>

            <div className="section-title-row">
              <h2>New arrivals</h2>
              <Link to="/products">View all →</Link>
            </div>
            <div className="grid-products">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
