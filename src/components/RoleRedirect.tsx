import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

/**
 * RoleRedirect
 * 
 * Used on the root path '/' or shared paths to ensure that ADMIN 
 * and STAFF are automatically pushed to their workspaces.
 */
const RoleRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuthStore();

  if (loading) return null;

  if (isAuthenticated && user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'AIRLINE_STAFF') return <Navigate to="/staff/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleRedirect;
