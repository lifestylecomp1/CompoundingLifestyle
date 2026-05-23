import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { createAdminPartner, fetchAdminPartners, type AdminPartnerRow, type PartnerRole } from '../lib/api';
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
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'provider' as PartnerRole,
  });

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);
    setCreating(true);
    try {
      const partner = await createAdminPartner({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      setPartners((current) => [...current, partner].sort((a, b) => a.name.localeCompare(b.name)));
      setForm({ name: '', email: '', password: '', role: 'provider' });
      setCreateSuccess(`Created ${partner.email}.`);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Failed to create account');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="page-layout admin-page">
      <header className="page-header">
        <h1>Access control</h1>
        <p className="page-subtitle">
          Portal sections and file catalog are the same for everyone; each account has its own role, section access, and
          file visibility. Choose an account to edit.
        </p>
      </header>

      <section className="admin-create-card">
        <div className="admin-create-card-head">
          <div>
            <h2>Create account</h2>
            <p>Add a partner account, then open it below to fine-tune section and file access.</p>
          </div>
          <button type="button" className="admin-secondary-button" onClick={() => setCreateOpen((open) => !open)}>
            {createOpen ? 'Cancel' : 'New account'}
          </button>
        </div>

        {createOpen && (
          <form className="admin-create-form" onSubmit={handleCreate}>
            {createError && (
              <div className="admin-error" role="alert">
                {createError}
              </div>
            )}
            {createSuccess && (
              <div className="admin-success" role="status">
                {createSuccess}
              </div>
            )}
            <label>
              Name
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                required
              />
            </label>
            <label>
              Temporary password
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                minLength={8}
                required
              />
            </label>
            <label>
              Role
              <select
                value={form.role}
                onChange={(e) => setForm((current) => ({ ...current, role: e.target.value as PartnerRole }))}
              >
                <option value="provider">Provider</option>
                <option value="sales_rep">Sales rep</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <button type="submit" className="admin-primary-button" disabled={creating}>
              {creating ? 'Creating…' : 'Create account'}
            </button>
          </form>
        )}
      </section>

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
