import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from './AdminLayout';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { canAccess, isAuthenticated } = useAdminAuth();
  const { isInitialized, loading } = useAuth();

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccess) {
    return <Navigate to="/ads" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};