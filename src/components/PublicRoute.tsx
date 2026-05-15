import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

/**
 * PublicRoute
 * 
 * Prevents authenticated users from accessing login/register pages.
 * Redirects them to their respective role-based dashboards.
 */
const PublicRoute: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuthStore();

  if (loading) return null;

  if (isAuthenticated && user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'AIRLINE_STAFF') return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
