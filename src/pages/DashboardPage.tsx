import React from 'react';
import { useAuth } from '../context/AuthContext';
import { OwnerDashboard } from '../components/dashboard/OwnerDashboard';
import { TenantDashboard } from '../components/dashboard/TenantDashboard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Accès non autorisé</h1>
          <p className="text-gray-600 mt-2">Veuillez vous connecter pour accéder au dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      {user.role === 'owner' ? <OwnerDashboard /> : <TenantDashboard />}
    </div>
  );
};