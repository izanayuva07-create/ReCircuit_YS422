import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import Loader from './Loader';

interface ProtectedRouteProps {
  role?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading && !user) return <Loader fullPage message="Restoring your session…" />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}${location.hash}` }} />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return <Outlet />;
};

export default ProtectedRoute;
