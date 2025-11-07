import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyOtpPage } from './pages/auth/VerifyOtpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordOtpPage } from './pages/auth/ResetPasswordOtpPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';

import { AdsPage } from './pages/AdsPage';
import AnnonceDetailPage from './pages/AnnonceDetailPage';
import { CreateAdPage } from './pages/CreateAdPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { UserProfilePage } from './pages/UserProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { RequestsPage } from './pages/RequestsPage';
import { RequestDetailPage } from './pages/RequestDetailPage';
// TODO: Messagerie - À implémenter plus tard
// import { MessagesPage } from './pages/MessagesPage';
import { BookingsPage } from './pages/BookingsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UsersManagement } from './pages/admin/UsersManagement';
import { AdsManagement } from './pages/admin/AdsManagement';
import { BookingsManagement } from './pages/admin/BookingsManagement';
import { NotificationsManagement } from './pages/admin/NotificationsManagement';
import { RolePermissionsManagement } from './pages/admin/RolePermissionsManagement';
import { Analytics } from './pages/admin/Analytics';
import { CategoriesManagement } from './pages/admin/CategoriesManagement';
import { ReviewsModeration } from './pages/admin/ReviewsModeration';
import { ContactMessages } from './pages/admin/ContactMessages';
import { ReportsManagement } from './pages/admin/ReportsManagement';
import { EmailTemplates } from './pages/admin/EmailTemplates';
import { Maintenance } from './pages/admin/Maintenance';
import { ActivityLogs } from './pages/admin/ActivityLogs';
import { FinancialReports } from './pages/admin/FinancialReports';
import { MediaManagement } from './pages/admin/MediaManagement';
import { SupportTickets } from './pages/admin/SupportTickets';
import { AuditTrail } from './pages/admin/AuditTrail';
import { SystemMonitoring } from './pages/admin/SystemMonitoring';
import { SessionManagement } from './pages/admin/SessionManagement';
import { DataImportExport } from './pages/admin/DataImportExport';
import { DataCleanup } from './pages/admin/DataCleanup';
import { SystemTests } from './pages/admin/SystemTests';
import { FavoritesPage } from './pages/FavoritesPage';

import { Settings } from './pages/admin/Settings';
import { AdminRoute } from './components/admin/AdminRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
// TODO: Messagerie - Import temporaire pour éviter les erreurs
import { MessagesProvider } from './context/MessagesContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { HelpButton } from './components/ui/HelpButton';
import { CookieConsent } from './components/ui/CookieConsent';
import { NotificationSettingsPage } from './pages/NotificationSettingsPage';
import { ReferralPage } from './pages/ReferralPage';
import VerificationPage from './pages/VerificationPage';
import AdminVerificationPage from './pages/AdminVerificationPage';

import OfflineIndicator from './components/OfflineIndicator';
import OfflineAdsPage from './pages/OfflineAdsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PaymentPage from './pages/PaymentPage';
import PaymentReturnPage from './pages/PaymentReturnPage';

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  // TODO: Messagerie - Retirer '/messages' quand implémenté
  const hideFooter = /* location.pathname === '/messages' || */ location.pathname.startsWith('/admin') || !!user;
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <div className="min-h-screen bg-gray-50">
      {!isAdminRoute && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password-otp" element={<ResetPasswordOtpPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ads" element={<AdsPage />} />
          <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
          <Route path="/requests/:id" element={<ProtectedRoute><RequestDetailPage /></ProtectedRoute>} />
          {/* TODO: Messagerie - À implémenter plus tard */}
          {/* <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} /> */}
          <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
          <Route path="/payment/:bookingId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/payment/return" element={<PaymentReturnPage />} />
          <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/offline-ads" element={<ProtectedRoute><OfflineAdsPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />

          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/notification-settings" element={<ProtectedRoute><NotificationSettingsPage /></ProtectedRoute>} />
          <Route path="/referrals" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
          <Route path="/verification" element={<ProtectedRoute><VerificationPage /></ProtectedRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UsersManagement /></AdminRoute>} />
          <Route path="/admin/ads" element={<AdminRoute><AdsManagement /></AdminRoute>} />
          <Route path="/admin/bookings" element={<AdminRoute><BookingsManagement /></AdminRoute>} />
          <Route path="/admin/notifications" element={<AdminRoute><NotificationsManagement /></AdminRoute>} />
          <Route path="/admin/permissions" element={<AdminRoute><RolePermissionsManagement /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><CategoriesManagement /></AdminRoute>} />
          <Route path="/admin/reviews" element={<AdminRoute><ReviewsModeration /></AdminRoute>} />
          <Route path="/admin/contact-messages" element={<AdminRoute><ContactMessages /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><ReportsManagement /></AdminRoute>} />
          <Route path="/admin/emails" element={<AdminRoute><EmailTemplates /></AdminRoute>} />
          <Route path="/admin/maintenance" element={<AdminRoute><Maintenance /></AdminRoute>} />
          <Route path="/admin/logs" element={<AdminRoute><ActivityLogs /></AdminRoute>} />
          <Route path="/admin/financial" element={<AdminRoute><FinancialReports /></AdminRoute>} />
          <Route path="/admin/media" element={<AdminRoute><MediaManagement /></AdminRoute>} />
          <Route path="/admin/support" element={<AdminRoute><SupportTickets /></AdminRoute>} />
          <Route path="/admin/audit" element={<AdminRoute><AuditTrail /></AdminRoute>} />
          <Route path="/admin/monitoring" element={<AdminRoute><SystemMonitoring /></AdminRoute>} />
          <Route path="/admin/sessions" element={<AdminRoute><SessionManagement /></AdminRoute>} />
          <Route path="/admin/data-import-export" element={<AdminRoute><DataImportExport /></AdminRoute>} />
          <Route path="/admin/data-cleanup" element={<AdminRoute><DataCleanup /></AdminRoute>} />
          <Route path="/admin/system-tests" element={<AdminRoute><SystemTests /></AdminRoute>} />
          <Route path="/admin/verifications" element={<AdminRoute><AdminVerificationPage /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><Settings /></AdminRoute>} />
          <Route path="/create-ad" element={<ProtectedRoute><CreateAdPage /></ProtectedRoute>} />
          <Route path="/user/:userId" element={<UserProfilePage />} />

          <Route path="/annonce/:id" element={<AnnonceDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
      <HelpButton />
      <OfflineIndicator />
      <CookieConsent />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <NotificationProvider>
          {/* TODO: Messagerie - Provider temporaire pour éviter les erreurs */}
          <MessagesProvider>
            <AppContent />
          </MessagesProvider>
        </NotificationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;