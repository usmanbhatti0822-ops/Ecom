import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import QuantityStepper from '../components/QuantityStepper';

export default function ProductDetails() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then((res) => setProduct(res.data.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (notFound || !product) {
    return (
      <div className="container page">
        <h2>Product not found</h2>
        <Link to="/products">← Back to products</Link>
      </div>
    );
  }

  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="container page">
      <div className="breadcrumb text-soft">
        <Link to="/products">Products</Link> / {product.category?.name && <Link to={`/products?category=${product.category._id}`}>{product.category.name}</Link>} / {product.name}
      </div>

      <div className="product-detail-grid">
        <div className="product-detail-media">
          {product.image_url ? <img src={product.image_url} alt={product.name} /> : <div className="ticket-media-placeholder" style={{ height: 400 }}>No image</div>}
        </div>
        <div>
          {product.category?.name && <div className="ticket-category">{product.category.name}</div>}
          <h1 style={{ fontSize: '2rem' }}>{product.name}</h1>
          <p style={{ fontSize: '1.6rem', color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: 16 }}>
            ${Number(product.price).toFixed(2)}
          </p>

          <div style={{ marginBottom: 20 }}>
            {outOfStock && <span className="badge badge-cancelled">Out of stock</span>}
            {!outOfStock && lowStock && <span className="badge badge-pending">Low stock — {product.stock} left</span>}
            {!outOfStock && !lowStock && <span className="badge badge-confirmed">In stock</span>}
          </div>

          <p>{product.description}</p>

          {!outOfStock && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
              <QuantityStepper value={qty} onChange={setQty} max={product.stock} />
              <button className="btn btn-accent" onClick={() => { addItem(product, qty); showToast(`Added ${qty} × ${product.name} to cart`, 'success'); }}>
                Add to cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
