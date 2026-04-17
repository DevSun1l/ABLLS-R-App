import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Lightweight auth guard for admin routes.
 * Unlike ProtectedRoute, this does NOT render sidebar/header —
 * admin pages use AdminLayout for their own shell.
 */
const AdminRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
