import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length && !allowedRoles.includes(user.role)) {
    const redirect = user.role === 'admin' ? '/dashboard/admin' : user.role === 'provider' ? '/dashboard/provider' : '/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children;
}
