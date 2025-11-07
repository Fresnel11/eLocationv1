import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Home, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  BarChart3,
  Bell,
  Shield,
  Folder,
  MessageSquare,
  Flag,
  Mail,
  Wrench,
  FileText,
  DollarSign,
  HardDrive,
  MessageCircle,
  Activity,
  Monitor,
  Database,
  Trash2,
  TestTube,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const { unreadCount } = useNotifications();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/users', icon: Users, label: 'Utilisateurs' },
    { path: '/admin/verifications', icon: UserCheck, label: 'Vérifications' },
    { path: '/admin/ads', icon: Home, label: 'Annonces' },
    { path: '/admin/bookings', icon: Calendar, label: 'Réservations' },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
    ...(user?.role?.name === 'super_admin' ? [{ path: '/admin/permissions', icon: Shield, label: 'Permissions' }] : []),
    { path: '/admin/categories', icon: Folder, label: 'Catégories' },
    { path: '/admin/reviews', icon: MessageSquare, label: 'Modération Avis' },
    { path: '/admin/contact-messages', icon: Mail, label: 'Messages Contact' },
    { path: '/admin/reports', icon: Flag, label: 'Signalements' },
    { path: '/admin/emails', icon: Mail, label: 'Templates Emails' },
    { path: '/admin/maintenance', icon: Wrench, label: 'Maintenance' },
    { path: '/admin/logs', icon: FileText, label: 'Logs d\'Activité' },
    { path: '/admin/financial', icon: DollarSign, label: 'Rapports Financiers' },
    { path: '/admin/media', icon: HardDrive, label: 'Gestion Médias' },
    { path: '/admin/support', icon: MessageCircle, label: 'Support Client' },
    { path: '/admin/audit', icon: Shield, label: 'Audit Trail' },
    { path: '/admin/monitoring', icon: Activity, label: 'Monitoring' },
    { path: '/admin/sessions', icon: Monitor, label: 'Sessions' },
    { path: '/admin/data-import-export', icon: Database, label: 'Import/Export' },
    { path: '/admin/data-cleanup', icon: Trash2, label: 'Nettoyage' },
    { path: '/admin/system-tests', icon: TestTube, label: 'Tests Système' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/settings', icon: Settings, label: 'Paramètres' },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Always Fixed */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col`}>
        
        {/* Header */}
        <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">A</span>
            </div>
            <span className="ml-2 text-base sm:text-lg font-semibold text-gray-900">Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto mt-4 sm:mt-6 px-2 sm:px-3">
          <div className="space-y-2 pb-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.path, item.exact)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Info - Fixed at bottom */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 p-3 sm:p-4">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">Administrateur</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content - With left margin for sidebar */}
      <div className="lg:ml-64 min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Administration</h1>
            <div className="w-9"></div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

