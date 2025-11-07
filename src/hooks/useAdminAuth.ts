import { useAuth } from '../context/AuthContext';

export const useAdminAuth = () => {
  const { user, isAuthenticated } = useAuth();

  const isAdmin = user?.role?.name === 'admin' || user?.role?.name === 'super_admin';
  const isSuperAdmin = user?.role?.name === 'super_admin';

  return {
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    user,
    canAccess: isAuthenticated && isAdmin,
  };
};