import { useEffect, useState } from 'react';
import api from '../api/client';
import CategoryCard from '../components/CategoryCard';
import Loader from '../components/Loader';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container page">
      <div className="section-title-row"><h2>Categories</h2></div>
      {loading ? <Loader /> : (
        <div className="grid-categories">
          {categories.map((c) => <CategoryCard key={c._id} category={c} />)}
        </div>
      )}
    </div>
  );
}
