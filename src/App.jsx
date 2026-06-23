import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LegalConnectHome from './components/LegalConnectHome';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import Dashboard from './components/Dashboard';           // Lawyer Portal
import ClientDashboard from './components/ClientDashboard'; // Client Portal
import AdminPortal from './components/AdminPortal';        // Admin Portal
import LawyerRegistration from './components/LawyerRegistration';
import ClientRegistration from './components/ClientRegistration';

import { AuthProvider, useAuth } from './contexts/AuthContext';

/* ── Auth guards ── */
const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  return isAuthenticated ? children : <Navigate to={redirectTo} replace />;
};

const ProtectedAdminRoute = ({ children, redirectTo = '/admin-login' }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  return (isAuthenticated && isAdmin) ? children : <Navigate to={redirectTo} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LegalConnectHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/register" element={<ClientRegistration />} />
          <Route path="/register-lawyer" element={<LawyerRegistration />} />

          {/* Protected Portals */}
          <Route path="/lawyer/*" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/client/*" element={
            <ProtectedRoute><ClientDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/*" element={
            <ProtectedAdminRoute><AdminPortal /></ProtectedAdminRoute>
          } />

          {/* Legacy redirects */}
          <Route path="/portfolio"         element={<Navigate to="/lawyer"  replace />} />
          <Route path="/client-dashboard"  element={<Navigate to="/client"  replace />} />

          {/* 404 → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
