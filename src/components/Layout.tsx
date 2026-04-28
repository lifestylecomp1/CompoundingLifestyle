import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Droplets,
  ShieldCheck,
  Users,
  Package,
  LayoutDashboard,
  LogOut,
  Landmark,
  ClipboardList,
  Settings,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { FeatureKey } from '../lib/features';
import './Layout.css';

type NavItem = {
  path: string;
  icon: typeof BookOpen;
  label: string;
  feature: FeatureKey | null;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', feature: null },
  { path: '/catalog-and-pricing', icon: BookOpen, label: 'Catalog & Pricing', feature: 'catalog_pricing' },
  { path: '/clinical-education', icon: FileText, label: 'Clinical Education', feature: 'clinical_education' },
  { path: '/state-licenses', icon: Landmark, label: 'State Licenses', feature: 'state_licenses' },
  { path: '/provider-information', icon: ClipboardList, label: 'Provider information', feature: 'provider_information' },
  { path: '/dosing', icon: Droplets, label: 'Dosing Guides', feature: 'dosing' },
  { path: '/coas', icon: ShieldCheck, label: 'CoAs', feature: 'coas' },
  { path: '/patient-education', icon: Users, label: 'Patient Education', feature: 'patient_education' },
  { path: '/products', icon: Package, label: 'Product Reference', feature: 'products' },
  { path: '/admin', icon: Settings, label: 'Access control', feature: null, adminOnly: true },
];

export default function Layout() {
  const location = useLocation();
  const { partner, logout, isAdmin, canAccess, isAuthenticated } = useAuth();

  const visible = navItems.filter((item) => {
    if (item.adminOnly) return isAdmin;
    if (item.feature === null) return true;
    return canAccess(item.feature);
  });

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand" title="Dashboard">
            <span className="sidebar-logo-wrap">
              <img src="/logo.png" alt="" className="sidebar-logo" width={220} height={80} />
            </span>
            <span className="sr-only">Lifestyle Compounding</span>
          </Link>
          <span className="portal-badge">Partner Portal</span>
        </div>
        <nav className="sidebar-nav">
          {visible.map(({ path, icon: Icon, label }) => {
            const active =
              path === '/admin'
                ? location.pathname === '/admin' || location.pathname.startsWith('/admin/')
                : location.pathname === path;
            return (
            <Link
              key={path}
              to={path}
              className={`nav-item ${active ? 'active' : ''}`}
            >
              <Icon className="nav-icon" size={20} />
              <span>{label}</span>
            </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          {isAuthenticated && (
            <div className="partner-bar">
              <span className="partner-name">{partner?.name ?? 'Signed in'}</span>
              <button type="button" className="btn-logout" onClick={logout} title="Sign out">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
          <p className="partner-note">Your access is private. Other partners cannot see your information.</p>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
