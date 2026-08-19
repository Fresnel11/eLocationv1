import { useAuth } from '../context/AuthContext';

export const useAdminAuth = () => {
  const { user, isAuthenticated } = useAuth();

  const isAdmin = user?.role?.name === 'admin' || user?.role?.name === 'super_admin';
  const isSuperAdmin = user?.role?.name === 'super_admin';
  const isCategoryManager = user?.role?.name === 'category_manager';
  const managedCategoryIds = user?.managedCategoryIds || [];

  return {
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isCategoryManager,
    managedCategoryIds,
    user,
    canAccess: isAuthenticated && (isAdmin || isCategoryManager),
  };
};