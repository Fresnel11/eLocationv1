import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, Settings, LogOut, ChevronDown, Search, Plus, LayoutDashboard,
  MessageSquare, User, Calendar, Heart, Info, Phone, HelpCircle, LogIn,
  UserPlus, Gift, Shield,
} from 'lucide-react';
import { NotificationBell } from '../ui/NotificationBell';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';

// TODO: Messagerie — réactiver le lien /messages une fois la route décommentée dans App.tsx.

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const AUTH_LINKS: NavItem[] = [
  { to: '/requests', label: 'Demandes', icon: MessageSquare },
  { to: '/bookings', label: 'Réservations', icon: Calendar },
  { to: '/favorites', label: 'Favoris', icon: Heart },
];

const GUEST_LINKS: NavItem[] = [
  { to: '/about', label: 'À propos', icon: Info },
  { to: '/contact', label: 'Contact', icon: Phone },
  { to: '/faq', label: 'FAQ', icon: HelpCircle },
];

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
  'bg-indigo-500', 'bg-red-500', 'bg-amber-500', 'bg-teal-500',
];

const getAvatarColor = (name?: string | null) => {
  const hash = String(name ?? '').split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (firstName?: string | null, lastName?: string | null) => {
  const initials = `${String(firstName ?? '').charAt(0)}${String(lastName ?? '').charAt(0)}`.toUpperCase();
  return initials || '?';
};

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role?.name === 'admin' || user?.role?.name === 'super_admin';
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  const avatarSeed = `${user?.firstName ?? ''}${user?.lastName ?? ''}`;
  const navLinks = user ? AUTH_LINKS : GUEST_LINKS;

  // Actif aussi sur les sous-routes : /requests/42 surligne « Demandes ».
  const isActive = useCallback(
    (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`),
    [location.pathname],
  );

  // La barre se compacte au défilement pour libérer de la hauteur utile.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fermeture du menu utilisateur au clic extérieur.
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [isUserMenuOpen]);

  // Échap ferme le menu ouvert.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Empêche le défilement de l'arrière-plan quand le tiroir mobile est ouvert.
  useEffect(() => {
    if (!isMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [isMenuOpen]);

  // Toute navigation referme les menus.
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  const desktopLinkClass = (path: string) =>
    `relative px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
      isActive(path)
        ? 'text-blue-700 bg-blue-50'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const drawerLinkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-colors ${
      isActive(path)
        ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

  const avatar = (size: 'sm' | 'lg') => {
    const box = size === 'sm' ? 'h-9 w-9 text-xs' : 'h-11 w-11 text-sm';
    return user?.profilePicture ? (
      <img src={user.profilePicture} alt="" className={`${box} rounded-full object-cover ring-2 ring-white`} />
    ) : (
      <span
        className={`${box} ${getAvatarColor(avatarSeed)} flex items-center justify-center rounded-full font-bold text-white ring-2 ring-white`}
      >
        {getInitials(user?.firstName, user?.lastName)}
      </span>
    );
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Aller au contenu
      </a>

      <header
        className={`sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl transition-all duration-300 ${
          isScrolled ? 'border-slate-200 shadow-sm' : 'border-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center gap-4 transition-all duration-300 ${isScrolled ? 'h-[4.5rem]' : 'h-20'}`}>

            <Link
              to="/"
              aria-label="eLocation Bénin, accueil"
              className="group shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <Logo className="hidden sm:inline-flex" />
              <Logo markOnly className="sm:hidden" />
            </Link>

            {/* Navigation principale — la recherche vit dans le hero, pas ici. */}
            <nav aria-label="Navigation principale" className="ml-2 hidden items-center gap-1 lg:flex">
              <Link to="/ads" className={desktopLinkClass('/ads')} aria-current={isActive('/ads') ? 'page' : undefined}>
                Annonces
              </Link>
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} className={desktopLinkClass(to)} aria-current={isActive(to) ? 'page' : undefined}>
                  {label}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              {user ? (
                <>
                  <Link
                    to="/create-ad"
                    className="hidden items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:inline-flex"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden lg:inline">Publier</span>
                  </Link>

                  <NotificationBell />

                  <div className="relative hidden md:block" ref={userMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsUserMenuOpen((open) => !open)}
                      aria-expanded={isUserMenuOpen}
                      aria-haspopup="menu"
                      aria-label="Menu du compte"
                      className="flex items-center gap-2 rounded-2xl p-1 pr-2 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      {avatar('sm')}
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isUserMenuOpen && (
                      <div
                        role="menu"
                        className="absolute right-0 z-[60] mt-2 w-72 animate-slide-down overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5"
                      >
                        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-4">
                          {avatar('lg')}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">{fullName || 'Mon compte'}</p>
                            <p className="truncate text-xs text-slate-500">{user.email || user.phone}</p>
                          </div>
                        </div>

                        <div className="p-1.5">
                          <DropdownLink to={`/user/${user.id}`} icon={User} label="Mon profil" />
                          <DropdownLink to="/dashboard" icon={LayoutDashboard} label="Tableau de bord" />
                          <DropdownLink to="/referrals" icon={Gift} label="Parrainage" />
                          <DropdownLink to="/settings" icon={Settings} label="Paramètres" />
                          {isAdmin && <DropdownLink to="/admin" icon={Shield} label="Administration" />}
                        </div>

                        <div className="border-t border-slate-100 p-1.5">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4" />
                            Déconnexion
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden items-center gap-2 md:flex">
                  <Link
                    to="/login"
                    className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    S'inscrire
                  </Link>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                aria-expanded={isMenuOpen}
                aria-label="Ouvrir le menu"
                className="rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tiroir mobile */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
            className="absolute right-0 top-0 flex h-full w-[min(22rem,88vw)] animate-slide-up flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
              <Logo />
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Fermer le menu"
                className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
              {user && (
                <Link to="/create-ad" className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700">
                  <Plus className="h-5 w-5" />
                  Publier une annonce
                </Link>
              )}

              <Link to="/ads" className={drawerLinkClass('/ads')} aria-current={isActive('/ads') ? 'page' : undefined}>
                <Search className="h-5 w-5" />
                Annonces
              </Link>

              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} className={drawerLinkClass(to)} aria-current={isActive(to) ? 'page' : undefined}>
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              ))}
            </div>

            <div className="border-t border-slate-100 px-4 py-4">
              {user ? (
                <div className="space-y-1">
                  <div className="mb-2 flex items-center gap-3 px-1">
                    {avatar('lg')}
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900">{fullName || 'Mon compte'}</p>
                      <p className="truncate text-xs text-slate-500">{user.email || user.phone}</p>
                    </div>
                  </div>
                  <Link to={`/user/${user.id}`} className={drawerLinkClass(`/user/${user.id}`)}>
                    <User className="h-5 w-5" />
                    Mon profil
                  </Link>
                  <Link to="/settings" className={drawerLinkClass('/settings')}>
                    <Settings className="h-5 w-5" />
                    Paramètres
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className={drawerLinkClass('/admin')}>
                      <Shield className="h-5 w-5" />
                      Administration
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    Déconnexion
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-100">
                    <LogIn className="h-5 w-5" />
                    Connexion
                  </Link>
                  <Link to="/register" className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700">
                    <UserPlus className="h-5 w-5" />
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const DropdownLink: React.FC<{
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}> = ({ to, icon: Icon, label }) => (
  <Link
    to={to}
    role="menuitem"
    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
  >
    <Icon className="h-4 w-4 text-slate-400" />
    {label}
  </Link>
);
