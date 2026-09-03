import { Link } from 'react-router-dom';

export default function CategoryCard({ category }) {
  return (
    <Link to={`/products?category=${category._id}`} className="category-card">
      <h3 style={{ marginBottom: 4 }}>{category.name}</h3>
      <p className="text-soft" style={{ marginBottom: 6, fontSize: '.85rem' }}>{category.description}</p>
      <span className="mono text-soft" style={{ fontSize: '.78rem' }}>{category.productCount ?? 0} products</span>
    </Link>
  );
}
