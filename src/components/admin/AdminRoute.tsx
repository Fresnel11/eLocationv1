import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from './AdminLayout';

interface AdminRouteProps {
  children: React.ReactNode;
  /**
   * Restreint l'accès au-delà du "canAccess" de base :
   * - 'admin' : réservé à admin/super_admin, jamais à un category_manager (hors de son périmètre catégorie).
   * - 'super_admin' : réservé au super_admin (ex. gestion des délégations elles-mêmes).
   * Omis : accessible à tout profil admin, category_manager inclus (périmètre catégorie du plan).
   */
  restrictTo?: 'admin' | 'super_admin';
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children, restrictTo }) => {
  const { canAccess, isAdmin, isSuperAdmin, isAuthenticated } = useAdminAuth();
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

  if (restrictTo === 'super_admin' && !isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (restrictTo === 'admin' && !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};