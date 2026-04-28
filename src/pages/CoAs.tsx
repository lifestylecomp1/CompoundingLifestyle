import { useEffect, useState } from 'react';
import MaterialCard from '../components/MaterialCard';
import { fetchCoas, openMaterialFileInNewTab, type CoAItem } from '../lib/api';
import './PageLayout.css';

export default function CoAs() {
  const [items, setItems] = useState<CoAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCoas();
        if (!cancelled) setItems(data);
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

  return (
    <div className="page-layout">
      <header className="page-header">
        <h1>Certificates of Analysis</h1>
        <p className="page-subtitle">CoAs and validation documents for quality assurance.</p>
      </header>

      {loading && <p className="page-subtitle">Loading…</p>}
      {error && (
        <p className="page-subtitle" role="alert" style={{ color: '#b91c1c' }}>
          {error}
        </p>
      )}
      {!loading && !error && items.length === 0 && (
        <p className="page-subtitle">No CoAs are enabled for your account.</p>
      )}
      {!loading && !error && items.length > 0 && (
        <div className="material-grid">
          {items.map((item) => (
            <MaterialCard
              key={item.id}
              title={item.title}
              fileType={item.fileType}
              onView={() => {
                void openMaterialFileInNewTab(item.id).catch((e) => {
                  window.alert(e instanceof Error ? e.message : 'Could not open file');
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
