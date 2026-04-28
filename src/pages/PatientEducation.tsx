import { useEffect, useState } from 'react';
import MaterialCard from '../components/MaterialCard';
import {
  fetchPatientBrochures,
  fetchPatientEducationCategories,
  openMaterialFileInNewTab,
  type PatientBrochureItem,
  type PatientEducationCategoryItem,
} from '../lib/api';
import './PageLayout.css';

export default function PatientEducation() {
  const [brochures, setBrochures] = useState<PatientBrochureItem[]>([]);
  const [categories, setCategories] = useState<PatientEducationCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [b, c] = await Promise.all([fetchPatientBrochures(), fetchPatientEducationCategories()]);
        if (!cancelled) {
          setBrochures(b);
          setCategories(c);
        }
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
        <h1>Patient Education</h1>
        <p className="page-subtitle">Pamphlets and fact sheets to share with patients. Organized by topic.</p>
      </header>

      {loading && <p className="page-subtitle">Loading…</p>}
      {error && (
        <p className="page-subtitle" role="alert" style={{ color: '#b91c1c' }}>
          {error}
        </p>
      )}

      {!loading && !error && brochures.length === 0 && categories.length === 0 && (
        <p className="page-subtitle">No patient education materials are enabled for your account.</p>
      )}

      {!loading && !error && brochures.length > 0 && (
        <section className="brochures-section">
          <h2 className="section-label">Patient Brochures</h2>
          <p className="section-desc">Ready-to-share PDFs — view or screen-share with customers</p>
          <div className="material-grid">
            {brochures.map((item) => (
              <MaterialCard
                key={item.id}
                title={item.title}
                fileType="PDF"
                description={item.description}
                onView={() => {
                  void openMaterialFileInNewTab(item.id).catch((e) => {
                    window.alert(e instanceof Error ? e.message : 'Could not open file');
                  });
                }}
              />
            ))}
          </div>
        </section>
      )}

      {!loading && !error && categories.length > 0 && (
        <section className="brochures-section">
          <h2 className="section-label">Pamphlet Categories</h2>
          <p className="section-desc">Organized by topic</p>
          <div className="material-grid">
            {categories.map((item) => (
              <MaterialCard
                key={item.id}
                title={item.name}
                fileType="Folder"
                description={`Category: ${item.folder}`}
                onView={() => {
                  void openMaterialFileInNewTab(item.id).catch((e) => {
                    window.alert(e instanceof Error ? e.message : 'Could not open file');
                  });
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
