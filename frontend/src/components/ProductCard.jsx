import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="ticket-card">
      <Link to={`/products/${product._id}`} className="ticket-media">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" />
        ) : (
          <div className="ticket-media-placeholder">No image</div>
        )}
        {outOfStock && <span className="ticket-flag ticket-flag-out">Out of stock</span>}
        {!outOfStock && lowStock && <span className="ticket-flag ticket-flag-low">Only {product.stock} left</span>}
      </Link>
      <div className="ticket-body">
        <Link to={`/products/${product._id}`} className="ticket-name">{product.name}</Link>
        {product.category?.name && <div className="ticket-category">{product.category.name}</div>}
        <div className="ticket-footer">
          <span className="ticket-price">${Number(product.price).toFixed(2)}</span>
          <button
            className="btn btn-accent btn-sm"
            disabled={outOfStock}
            onClick={() => addItem(product, 1)}
          >
            {outOfStock ? 'Sold out' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
