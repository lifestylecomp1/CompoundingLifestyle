import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { fetchProductQuickRef, type ProductQuickRefItem } from '../lib/api';
import { Search } from 'lucide-react';
import './PageLayout.css';
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState<ProductQuickRefItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductQuickRef();
        if (!cancelled) setProducts(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="page-layout">
      <header className="page-header">
        <h1>Product Reference</h1>
        <p className="page-subtitle">
          Quick lookup: drug name, what it does, sizes available. Use during sales calls or to learn the catalog.
        </p>
      </header>

      {loading && <p className="page-subtitle">Loading…</p>}
      {error && (
        <p className="page-subtitle" role="alert" style={{ color: '#b91c1c' }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          {products.length === 0 ? (
            <p className="page-subtitle">No product reference entries are enabled for your account.</p>
          ) : (
            <>
              <div className="product-grid">
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    name={product.name}
                    category={product.category}
                    description={product.description}
                    sizes={product.sizes}
                    notes={product.notes}
                  />
                ))}
              </div>
              {filtered.length === 0 && (
                <p className="no-results">No products match your search.</p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
