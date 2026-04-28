import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Droplets,
  ShieldCheck,
  Users,
  Package,
  Monitor,
  Landmark,
  ClipboardList,
  Settings,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { FeatureKey } from '../lib/features';
import './Dashboard.css';

type Section = {
  path: string;
  icon: typeof BookOpen;
  label: string;
  desc: string;
  feature: FeatureKey | null;
  adminOnly?: boolean;
};

const sections: Section[] = [
  { path: '/catalog-and-pricing', icon: BookOpen, label: 'Catalog & Pricing', desc: 'Product catalogs and volume pricing', feature: 'catalog_pricing' },
  { path: '/clinical-education', icon: FileText, label: 'Clinical Education', desc: 'Monographs & clinical reference materials', feature: 'clinical_education' },
  { path: '/state-licenses', icon: Landmark, label: 'State Licenses', desc: 'Board verification by state', feature: 'state_licenses' },
  {
    path: '/provider-information',
    icon: ClipboardList,
    label: 'Provider information',
    desc: 'Professional & shipping details for your account',
    feature: 'provider_information',
  },
  { path: '/dosing', icon: Droplets, label: 'Dosing Guides', desc: 'Dosing & administration', feature: 'dosing' },
  { path: '/coas', icon: ShieldCheck, label: 'CoAs', desc: 'Certificates of Analysis', feature: 'coas' },
  { path: '/patient-education', icon: Users, label: 'Patient Education', desc: 'Pamphlets & fact sheets', feature: 'patient_education' },
  { path: '/products', icon: Package, label: 'Product Reference', desc: 'Quick lookup: drug, sizes, pricing', feature: 'products' },
  { path: '/admin', icon: Settings, label: 'Access control', desc: 'Manage roles and portal features', feature: null, adminOnly: true },
];

export default function Dashboard() {
  const { isAdmin, canAccess } = useAuth();

  const visible = sections.filter((s) => {
    if (s.adminOnly) return isAdmin;
    if (s.feature === null) return false;
    return canAccess(s.feature);
  });

  return (
    <div className="dashboard">
      <header className="page-header">
        <h1>Partner Portal</h1>
        <p className="page-subtitle">
          Access materials, product info, and pricing. Share your screen with customers to show what we offer.
        </p>
      </header>

      <div className="screen-share-tip">
        <Monitor size={20} />
        <div>
          <strong>Screen sharing tip:</strong> Open any material here, then share your browser tab or screen in Zoom/Meet when presenting to customers.
        </div>
      </div>

      <div className="section-grid">
        {visible.map(({ path, icon: Icon, label, desc }) => (
          <Link key={path} to={path} className="section-card">
            <div className="section-card-icon">
              <Icon size={24} />
            </div>
            <div className="section-card-content">
              <h2>{label}</h2>
              <p>{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
