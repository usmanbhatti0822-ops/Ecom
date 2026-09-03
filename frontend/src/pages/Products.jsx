import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.data));
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    params.set('sort', sort);
    params.set('order', order);
    params.set('page', page);
    params.set('limit', 12);

    api.get(`/products?${params.toString()}`)
      .then((res) => {
        setProducts(res.data.data);
        setMeta(res.data.meta);
      })
      .finally(() => setLoading(false));
  }, [search, category, minPrice, maxPrice, sort, order, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  return (
    <div className="container page">
      <div className="section-title-row">
        <h2>{search ? `Results for "${search}"` : 'All products'}</h2>
      </div>

      <div className="products-layout">
        <aside className="filters card">
          <div className="field">
            <label>Category</label>
            <select value={category} onChange={(e) => updateParam('category', e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Price range</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" min="0" placeholder="Min" value={minPrice} onChange={(e) => updateParam('minPrice', e.target.value)} />
              <input type="number" min="0" placeholder="Max" value={maxPrice} onChange={(e) => updateParam('maxPrice', e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Sort by</label>
            <select value={`${sort}:${order}`} onChange={(e) => {
              const [s, o] = e.target.value.split(':');
              const next = new URLSearchParams(searchParams);
              next.set('sort', s); next.set('order', o); next.delete('page');
              setSearchParams(next);
            }}>
              <option value="createdAt:desc">Newest</option>
              <option value="price:asc">Price: Low to high</option>
              <option value="price:desc">Price: High to low</option>
              <option value="name:asc">Name: A–Z</option>
            </select>
          </div>
          <button className="btn btn-outline btn-block" onClick={() => setSearchParams({})}>Clear filters</button>
        </aside>

        <div>
          {loading ? <Loader /> : products.length === 0 ? (
            <EmptyState title="No products found" subtitle="Try adjusting your filters or search terms." />
          ) : (
            <>
              <div className="grid-products">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              <Pagination page={meta.page} totalPages={meta.totalPages} onChange={(p) => {
                const next = new URLSearchParams(searchParams);
                next.set('page', p);
                setSearchParams(next);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
