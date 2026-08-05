import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import IconCog from '~icons/line-md/cog';
import IconBell from '~icons/line-md/bell';
import IconMenu from '~icons/line-md/menu';
import IconClose from '~icons/line-md/close';
import IconPlus from '~icons/line-md/plus';
import IconLogout from '~icons/line-md/logout';
// Absents de line-md : repli sur Material Symbols, meme famille visuelle.
import IconGift from '~icons/material-symbols/redeem';
import IconDashboard from '~icons/material-symbols/dashboard-outline';
import IconShield from '~icons/material-symbols/admin-panel-settings-outline';
import { LogoMark } from '../ui/Logo';
import { ClickableAvatar } from '../ui/ClickableAvatar';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { LANDING_SECTIONS } from '../../pages/LandingPage';

/**
 * Navigation principale.
 *
 * `anchor` désigne une section de la page d'accueil : sur « / » le lien y fait
 * défiler, ailleurs il ramène à l'accueil sur cette section. `to` est la
 * destination pour les entrées qui sont de vraies pages.
 *
 * GUEST_LINKS : liens affichés aux visiteurs non connectés.
 * AUTH_LINKS  : liens affichés uniquement aux utilisateurs connectés.
 * COMMON_LINKS: liens communs aux deux états.
 */
const GUEST_ONLY_LINKS: Array<{ label: string; to: string; anchor?: string }> = [
  { label: 'Nos services', to: '/ads', anchor: LANDING_SECTIONS.categories },
  { label: 'Qui sommes-nous', to: '/about' },
];

const COMMON_LINKS: Array<{ label: string; to: string; anchor?: string }> = [
  { label: 'Devenir un Démarcheur', to: '/verification', anchor: LANDING_SECTIONS.howItWorks },
  { label: 'Termes et FAQs', to: '/terms' },
];

const ACCOUNT_LINKS = [
  { to: '/dashboard', label: 'Tableau de bord', icon: IconDashboard },
  { to: '/referrals', label: 'Parrainage', icon: IconGift },
  { to: '/settings', label: 'Paramètres', icon: IconCog },
];

/**
 * Rend un lien de navigation selon le contexte :
 * - page d'accueil + ancre  -> <a href="#..."> (défilement natif)
 * - autre page + ancre      -> <Link to="/#..."> (retour à l'accueil)
 * - pas d'ancre             -> <Link to="..."> classique
 */
const NavItem: React.FC<{
  link: { label: string; to: string; anchor?: string };
  isLanding: boolean;
  className: string | ((active: boolean) => string);
}> = ({ link, isLanding, className }) => {
  const resolve = (active: boolean) =>
    typeof className === 'function' ? className(active) : className;

  if (link.anchor) {
    return isLanding ? (
      <a href={`#${link.anchor}`} className={resolve(false)}>
        {link.label}
      </a>
    ) : (
      <Link to={`/#${link.anchor}`} className={resolve(false)}>
        {link.label}
      </Link>
    );
  }

  return (
    <NavLink to={link.to} className={({ isActive }) => resolve(isActive)}>
      {link.label}
    </NavLink>
  );
};

/** Bouton d'action de l'en-tête : carré arrondi, discret au repos. */
const IconAction: React.FC<{
  to: string;
  label: string;
  badge?: number;
  children: React.ReactNode;
}> = ({ to, label, badge, children }) => (
  <Link
    to={to}
    title={label}
    aria-label={label}
    className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[1.35rem] text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
  >
    {children}
    {!!badge && badge > 0 && (
      <span
        className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
        aria-hidden="true"
      />
    )}
  </Link>
);

/**
 * En-tête global de l'application (hors espaces admin et authentification).
 *
 * Icônes issues de line-md (Material Line Icons), compilées au build par
 * unplugin-icons. Les jeux Material Symbols ne servent qu'aux icônes absentes
 * de line-md.
 */
export const AppTopBar: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role?.name === 'admin' || user?.role?.name === 'super_admin';
  const isLanding = location.pathname === '/';

  // Liens de navigation : les visiteurs voient également "Nos services" et "Qui sommes-nous".
  const navLinks = user
    ? COMMON_LINKS
    : [...GUEST_ONLY_LINKS, ...COMMON_LINKS];

  // Une navigation ferme tout : sinon le tiroir reste ouvert sur la nouvelle page.
  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!accountOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [accountOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 bg-white">
      <div className="mx-auto flex h-[4.5rem] max-w-[1500px] items-center gap-7 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <LogoMark className="h-9 w-9" />
          <span className="text-[1.15rem] font-bold tracking-tight text-slate-900">eLocation</span>
        </Link>

        <span className="hidden h-7 w-px bg-slate-200 md:block" aria-hidden="true" />

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <NavItem
              key={link.label}
              link={link}
              isLanding={isLanding}
              className={(active) =>
                `text-sm transition-colors ${
                  active
                    ? 'font-semibold text-slate-900'
                    : 'font-medium text-slate-600 hover:text-slate-900'
                }`
              }
            />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {user && (
            <IconAction to="/settings" label="Paramètres">
              <IconCog />
            </IconAction>
          )}

          {user && (
            <IconAction to="/notifications" label="Notifications" badge={unreadCount}>
              <IconBell />
            </IconAction>
          )}

          <span className="mx-2 hidden h-7 w-px bg-slate-200 sm:block" aria-hidden="true" />

          {user ? (
            <div ref={accountRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setAccountOpen((o) => !o)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                aria-label="Menu du compte"
                className="flex items-center rounded-full transition-opacity hover:opacity-80"
              >
                <ClickableAvatar
                  avatarUrl={user.profilePicture}
                  userName={`${user.firstName} ${user.lastName}`}
                  size="md"
                />
              </button>

              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-3 w-60 animate-slide-down overflow-hidden rounded-[1.25rem] bg-white p-2 shadow-[0_12px_40px_rgba(15,23,42,0.16)]"
                >
                  <div className="px-3 py-2.5">
                    <p className="truncate font-semibold text-slate-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-sm text-slate-400">{user.email}</p>
                  </div>

                  <div className="my-1 h-px bg-slate-100" />

                  {ACCOUNT_LINKS.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      role="menuitem"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                      <link.icon className="text-[1.15rem]" />
                      {link.label}
                    </Link>
                  ))}

                  {isAdmin && (
                    <Link
                      to="/admin"
                      role="menuitem"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                      <IconShield className="text-[1.15rem]" />
                      Administration
                    </Link>
                  )}

                  <div className="my-1 h-px bg-slate-100" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    role="menuitem"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <IconLogout className="text-[1.15rem]" />
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden h-10 items-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:flex"
            >
              Se connecter
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[1.35rem] text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
          >
            <IconMenu />
          </button>
        </div>
      </div>

      {/* ---------- Tiroir mobile ---------- */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 flex h-full w-[min(22rem,88vw)] animate-slide-up flex-col bg-white">
            <div className="flex h-[4.5rem] items-center justify-between px-5">
              <span className="font-bold text-slate-900">Menu</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Fermer le menu"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[1.35rem] text-slate-500 transition-colors hover:bg-slate-100"
              >
                <IconClose />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 pb-4">
              {user && (
                <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <ClickableAvatar
                    avatarUrl={user.profilePicture}
                    userName={`${user.firstName} ${user.lastName}`}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-sm text-slate-400">{user.email}</p>
                  </div>
                </div>
              )}

              {navLinks.map((link) => (
                <NavItem
                  key={link.label}
                  link={link}
                  isLanding={isLanding}
                  className={(active) =>
                    `block rounded-xl px-4 py-3 text-[0.95rem] transition-colors ${
                      active
                        ? 'bg-blue-50 font-semibold text-blue-700'
                        : 'font-medium text-slate-600 hover:bg-slate-50'
                    }`
                  }
                />
              ))}

              {user && (
                <>
                  <div className="my-3 h-px bg-slate-100" />
                  {ACCOUNT_LINKS.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-[0.95rem] font-medium text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      <link.icon className="text-[1.2rem]" />
                      {link.label}
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-[0.95rem] font-medium text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      <IconShield className="text-[1.2rem]" />
                      Administration
                    </Link>
                  )}
                </>
              )}
            </nav>

            <div className="space-y-2.5 border-t border-slate-100 p-4">
              {user ? (
                <>
                  <Link
                    to="/create-ad"
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    <IconPlus className="text-[1.15rem]" />
                    Publier une annonce
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <IconLogout className="text-[1.15rem]" />
                    Se déconnecter
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="flex h-12 items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Créer un compte
                  </Link>
                  <Link
                    to="/login"
                    className="flex h-12 items-center justify-center rounded-xl text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
                  >
                    Se connecter
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
