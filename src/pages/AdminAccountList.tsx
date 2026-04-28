import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { fetchAdminPartners, type AdminPartnerRow, type PartnerRole } from '../lib/api';
import './PageLayout.css';
import './Admin.css';

function roleLabel(role: PartnerRole): string {
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'sales_rep':
      return 'Sales rep';
    default:
      return 'Provider';
  }
}

export default function AdminAccountList() {
  const [partners, setPartners] = useState<AdminPartnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await fetchAdminPartners();
        if (!cancelled) setPartners(p);
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
    <div className="page-layout admin-page">
      <header className="page-header">
        <h1>Access control</h1>
        <p className="page-subtitle">
          Portal sections and file catalog are the same for everyone; each account has its own role, section access, and
          file visibility. Choose an account to edit.
        </p>
      </header>

      {loading && (
        <div className="admin-loading" aria-busy="true">
          <span className="admin-loading-dot" />
          <span className="admin-loading-dot" />
          <span className="admin-loading-dot" />
          <span className="admin-loading-text">Loading accounts…</span>
        </div>
      )}
      {error && (
        <div className="admin-error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && partners.length === 0 && (
        <p className="admin-empty">No accounts yet. Add partners via your usual onboarding flow.</p>
      )}

      {!loading && !error && partners.length > 0 && (
        <ul className="admin-account-list">
          {partners.map((row) => (
            <li key={row.id}>
              <Link className="admin-account-row" to={`/admin/accounts/${row.id}`}>
                <div className="admin-account-row-main">
                  <span className="admin-account-name">{row.name}</span>
                  <span className="admin-account-email">{row.email}</span>
                </div>
                <span className={`admin-account-role admin-account-role--${row.role}`}>{roleLabel(row.role)}</span>
                <ChevronRight className="admin-account-chevron" size={20} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
