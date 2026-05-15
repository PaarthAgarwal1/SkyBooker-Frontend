import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

interface ProtectedRouteProps {
  allowedRoles: ('PASSENGER' | 'AIRLINE_STAFF' | 'ADMIN')[];
}

/**
 * ProtectedRoute
 * 
 * 1. Checks if user is authenticated.
 * 2. Checks if user has the required role.
 * 3. Redirects based on access state.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Verifying Identity...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but role not allowed -> Home or Dashboard
  if (user && !allowedRoles.includes(user.role as any)) {
    // If an Admin/Staff tries to access Passenger pages, or vice versa
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'AIRLINE_STAFF') return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
