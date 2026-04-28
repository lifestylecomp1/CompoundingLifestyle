import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CatalogAndPricing from './pages/CatalogAndPricing';
import Monographs from './pages/Monographs';
import Dosing from './pages/Dosing';
import CoAs from './pages/CoAs';
import PatientEducation from './pages/PatientEducation';
import Products from './pages/Products';
import StateLicenses from './pages/StateLicenses';
import ProviderInformation from './pages/ProviderInformation';
import AdminAccountList from './pages/AdminAccountList';
import AdminAccountAccess from './pages/AdminAccountAccess';
import type { FeatureKey } from './lib/features';
import './App.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function FeatureRoute({ feature, children }: { feature: FeatureKey; children: React.ReactNode }) {
  const { partner, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="page-layout">
        <p className="page-subtitle">Loading…</p>
      </div>
    );
  }
  if (!partner) return <Navigate to="/login" replace />;
  if (!partner.allowedFeatures.includes(feature)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { partner, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="page-layout">
        <p className="page-subtitle">Loading…</p>
      </div>
    );
  }
  if (!partner || partner.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route
              path="catalog-and-pricing"
              element={
                <FeatureRoute feature="catalog_pricing">
                  <CatalogAndPricing />
                </FeatureRoute>
              }
            />
            <Route path="catalogs" element={<Navigate to="/catalog-and-pricing" replace />} />
            <Route path="pricing" element={<Navigate to="/catalog-and-pricing" replace />} />
            <Route
              path="clinical-education"
              element={
                <FeatureRoute feature="clinical_education">
                  <Monographs />
                </FeatureRoute>
              }
            />
            <Route path="monographs" element={<Navigate to="/clinical-education" replace />} />
            <Route
              path="dosing"
              element={
                <FeatureRoute feature="dosing">
                  <Dosing />
                </FeatureRoute>
              }
            />
            <Route
              path="coas"
              element={
                <FeatureRoute feature="coas">
                  <CoAs />
                </FeatureRoute>
              }
            />
            <Route
              path="patient-education"
              element={
                <FeatureRoute feature="patient_education">
                  <PatientEducation />
                </FeatureRoute>
              }
            />
            <Route
              path="state-licenses"
              element={
                <FeatureRoute feature="state_licenses">
                  <StateLicenses />
                </FeatureRoute>
              }
            />
            <Route
              path="provider-information"
              element={
                <FeatureRoute feature="provider_information">
                  <ProviderInformation />
                </FeatureRoute>
              }
            />
            <Route
              path="products"
              element={
                <FeatureRoute feature="products">
                  <Products />
                </FeatureRoute>
              }
            />
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <Outlet />
                </AdminRoute>
              }
            >
              <Route index element={<AdminAccountList />} />
              <Route path="accounts/:partnerId" element={<AdminAccountAccess />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
