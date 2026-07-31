import React from 'react';
import { NavLink } from 'react-router-dom';
import IconHome from '~icons/line-md/home';
import IconCalendar from '~icons/line-md/calendar';
import IconClipboard from '~icons/line-md/clipboard-list';
import IconHeart from '~icons/line-md/heart';
import IconChat from '~icons/line-md/chat';
import IconQuestion from '~icons/line-md/question-circle';
import IconLogout from '~icons/line-md/logout';
// line-md n'a pas d'icône de portefeuille : repli sur le jeu Material Symbols,
// dans la même famille visuelle.
import IconWallet from '~icons/material-symbols/account-balance-wallet-outline';
import { useAuth } from '../../context/AuthContext';

type IconComponent = React.ComponentType<{ className?: string }>;

interface RailItem {
  to: string;
  icon: IconComponent;
  label: string;
}

const PRIMARY: RailItem[] = [
  { to: '/ads', icon: IconHome, label: 'Annonces' },
  { to: '/bookings', icon: IconCalendar, label: 'Mes réservations' },
  { to: '/favorites', icon: IconHeart, label: 'Favoris' },
  { to: '/dashboard', icon: IconClipboard, label: 'Mes annonces' },
  { to: '/requests', icon: IconWallet, label: 'Demandes' },
  { to: '/notifications', icon: IconChat, label: 'Messages' },
];

const SECONDARY: RailItem[] = [{ to: '/faq', icon: IconQuestion, label: 'Aide' }];

/**
 * Rail d'icônes flottant, détaché des bords.
 *
 * Masqué sous lg : sur mobile la navigation reste celle du bas de page, un rail
 * vertical y mangerait une largeur déjà rare.
 */
export const AppRail: React.FC = () => {
  const { user, logout } = useAuth();

  const itemClass = (isActive: boolean) =>
    `group relative flex h-11 w-11 items-center justify-center rounded-2xl text-[1.35rem] transition-all duration-200 ${
      isActive
        ? 'bg-white text-blue-600 shadow-[0_2px_10px_rgba(15,23,42,0.10)]'
        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
    }`;

  const Tooltip: React.FC<{ label: string }> = ({ label }) => (
    <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
      {label}
    </span>
  );

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-1 rounded-[2rem] bg-white p-2.5 shadow-[0_8px_40px_rgba(15,23,42,0.10)] lg:flex"
    >
      {PRIMARY.map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => itemClass(isActive)}>
          <item.icon />
          <Tooltip label={item.label} />
        </NavLink>
      ))}

      <span className="my-2 h-px w-6 bg-slate-200" aria-hidden="true" />

      {SECONDARY.map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => itemClass(isActive)}>
          <item.icon />
          <Tooltip label={item.label} />
        </NavLink>
      ))}

      {user && (
        <button
          type="button"
          onClick={logout}
          aria-label="Se déconnecter"
          className="group relative flex h-11 w-11 items-center justify-center rounded-2xl text-[1.35rem] text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <IconLogout />
          <Tooltip label="Se déconnecter" />
        </button>
      )}
    </nav>
  );
};
