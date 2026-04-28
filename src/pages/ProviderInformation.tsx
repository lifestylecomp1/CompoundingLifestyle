import { useEffect, useState } from 'react';
import {
  fetchProviderProfile,
  saveProviderProfile,
  type ProviderProfile,
} from '../lib/api';
import './PageLayout.css';
import './ProviderInformation.css';

const emptyForm: Omit<ProviderProfile, 'updatedAt'> = {
  providerFirstName: '',
  providerLastName: '',
  title: '',
  company: '',
  providerEmail: '',
  directPhone: '',
  stateLicenseNumber: '',
  licenseExpiration: '',
  dea: '',
  npi: '',
  specialty: '',
  shippingStreetAddress: '',
  shippingCity: '',
  shippingState: '',
  shippingCountry: '',
  shippingZipCode: '',
  shippingEmail: '',
  shippingPhone: '',
};

function profileToForm(p: ProviderProfile): Omit<ProviderProfile, 'updatedAt'> {
  const { updatedAt: _, ...rest } = p;
  return rest;
}

export default function ProviderInformation() {
  const [form, setForm] = useState<Omit<ProviderProfile, 'updatedAt'>>(emptyForm);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await fetchProviderProfile();
        if (!cancelled) {
          setForm(profileToForm(p));
          setUpdatedAt(p.updatedAt || null);
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

  function set<K extends keyof Omit<ProviderProfile, 'updatedAt'>>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const saved = await saveProviderProfile(form);
      setUpdatedAt(saved.updatedAt || null);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const savedLabel = updatedAt
    ? `Last saved: ${new Date(updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`
    : null;

  return (
    <div className="page-layout provider-form">
      <header className="page-header">
        <h1>Provider information</h1>
        <p className="page-subtitle">
          Please complete or update your professional and shipping details. Information is stored for your account only.
        </p>
      </header>

      {loading && <p className="provider-form-loading">Loading your profile…</p>}
      {error && (
        <div className="provider-form-status provider-form-status--error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="provider-form-status provider-form-status--success" role="status">
          Your information was saved.
        </div>
      )}

      <form onSubmit={handleSubmit} className="provider-form" autoComplete="on">
        <fieldset>
          <legend>Provider information</legend>
          <div className="provider-form-grid">
            <label>
              Provider first name
              <input
                type="text"
                name="providerFirstName"
                value={form.providerFirstName}
                onChange={(e) => set('providerFirstName', e.target.value)}
                autoComplete="given-name"
              />
            </label>
            <label>
              Provider last name
              <input
                type="text"
                name="providerLastName"
                value={form.providerLastName}
                onChange={(e) => set('providerLastName', e.target.value)}
                autoComplete="family-name"
              />
            </label>
            <label>
              Title
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                autoComplete="organization-title"
              />
            </label>
            <label>
              Company
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
                autoComplete="organization"
              />
            </label>
            <label>
              Email address
              <input
                type="email"
                name="providerEmail"
                value={form.providerEmail}
                onChange={(e) => set('providerEmail', e.target.value)}
                autoComplete="email"
              />
            </label>
            <label>
              Direct phone
              <input
                type="tel"
                name="directPhone"
                value={form.directPhone}
                onChange={(e) => set('directPhone', e.target.value)}
                autoComplete="tel"
              />
            </label>
            <label>
              State license number
              <input
                type="text"
                name="stateLicenseNumber"
                value={form.stateLicenseNumber}
                onChange={(e) => set('stateLicenseNumber', e.target.value)}
              />
            </label>
            <label>
              License expiration
              <input
                type="date"
                name="licenseExpiration"
                value={form.licenseExpiration}
                onChange={(e) => set('licenseExpiration', e.target.value)}
              />
            </label>
            <label>
              DEA
              <input type="text" name="dea" value={form.dea} onChange={(e) => set('dea', e.target.value)} />
            </label>
            <label>
              NPI
              <input type="text" name="npi" value={form.npi} onChange={(e) => set('npi', e.target.value)} inputMode="numeric" />
            </label>
            <label className="provider-form-grid--full">
              Specialty
              <input
                type="text"
                name="specialty"
                value={form.specialty}
                onChange={(e) => set('specialty', e.target.value)}
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Shipping address</legend>
          <div className="provider-form-grid">
            <label className="provider-form-grid--full">
              Street address
              <input
                type="text"
                name="shippingStreetAddress"
                value={form.shippingStreetAddress}
                onChange={(e) => set('shippingStreetAddress', e.target.value)}
                autoComplete="street-address"
              />
            </label>
            <label>
              City
              <input
                type="text"
                name="shippingCity"
                value={form.shippingCity}
                onChange={(e) => set('shippingCity', e.target.value)}
                autoComplete="address-level2"
              />
            </label>
            <label>
              State
              <input
                type="text"
                name="shippingState"
                value={form.shippingState}
                onChange={(e) => set('shippingState', e.target.value)}
                autoComplete="address-level1"
              />
            </label>
            <label>
              Country
              <input
                type="text"
                name="shippingCountry"
                value={form.shippingCountry}
                onChange={(e) => set('shippingCountry', e.target.value)}
                autoComplete="country-name"
              />
            </label>
            <label>
              Zip code
              <input
                type="text"
                name="shippingZipCode"
                value={form.shippingZipCode}
                onChange={(e) => set('shippingZipCode', e.target.value)}
                autoComplete="postal-code"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="shippingEmail"
                value={form.shippingEmail}
                onChange={(e) => set('shippingEmail', e.target.value)}
                autoComplete="email"
              />
            </label>
            <label>
              Phone number
              <input
                type="tel"
                name="shippingPhone"
                value={form.shippingPhone}
                onChange={(e) => set('shippingPhone', e.target.value)}
                autoComplete="tel"
              />
            </label>
          </div>
        </fieldset>

        <div className="provider-form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading || saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          {savedLabel && <span className="provider-form-meta">{savedLabel}</span>}
        </div>
      </form>
    </div>
  );
}
