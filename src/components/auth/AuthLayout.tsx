import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, type LucideIcon } from 'lucide-react';
import { LogoMark } from '../ui/Logo';

export interface AuthHighlight {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Couleur de la pastille, reprise de la palette du logo. */
  tint: string;
}

interface AuthLayoutProps {
  /** Titre du panneau de marque (colonne gauche, desktop). */
  panelTitle: React.ReactNode;
  panelSubtitle: string;
  highlights: AuthHighlight[];
  /** Titre du formulaire (colonne droite). */
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  /** Bas de colonne : lien secondaire vers l'autre parcours. */
  footer?: React.ReactNode;
  /** Le formulaire d'inscription a besoin de plus de largeur. */
  wide?: boolean;
}

/**
 * Coquille commune aux pages d'authentification : panneau de marque à gauche
 * (masqué sous lg), formulaire à droite. La Navbar est masquée sur ces routes
 * (voir App.tsx) pour éviter un double en-tête et garder l'utilisateur focalisé.
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  panelTitle,
  panelSubtitle,
  highlights,
  title,
  subtitle,
  children,
  footer,
  wide = false,
}) => (
  <div className="min-h-screen bg-white lg:grid lg:grid-cols-2 xl:grid-cols-[0.9fr_1.1fr]">
    {/* ---------- Panneau de marque ---------- */}
    <aside className="relative hidden overflow-hidden bg-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-14">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900" />
      {/* Halos diffus : donnent de la profondeur sans image à charger. */}
      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
      {/* Trame de points, identique à celle de la section CTA de l'accueil. */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.05%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

      <Link to="/" className="group relative inline-flex items-center gap-3 self-start">
        <span className="rounded-2xl bg-white/95 p-1.5 shadow-lg shadow-blue-950/30 transition-transform duration-300 group-hover:-translate-y-0.5">
          <LogoMark className="h-9 w-9" />
        </span>
        <span className="flex flex-col leading-none">
          <span className="text-xl font-extrabold tracking-tight text-white">eLocation</span>
          <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-blue-200/80">
            Bénin
          </span>
        </span>
      </Link>

      <div className="relative my-12">
        <h2 className="max-w-lg text-4xl font-bold leading-[1.15] tracking-tight text-white xl:text-[2.75rem]">
          {panelTitle}
        </h2>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-blue-100/90">{panelSubtitle}</p>

        <ul className="mt-12 space-y-5">
          {highlights.map(({ icon: Icon, title: hTitle, description, tint }) => (
            <li key={hTitle} className="flex items-start gap-4">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-white/20 ${tint}`}
              >
                <Icon className="h-5 w-5 text-white" />
              </span>
              <span className="pt-0.5">
                <span className="block font-semibold text-white">{hTitle}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-blue-100/70">
                  {description}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
        <ShieldCheck className="h-5 w-5 shrink-0 text-cyan-300" />
        <p className="text-sm text-blue-100/80">
          Vos données restent confidentielles et vos paiements passent par Mobile Money sécurisé.
        </p>
      </div>
    </aside>

    {/* ---------- Colonne formulaire ---------- */}
    <main className="flex min-h-screen flex-col px-5 py-6 sm:px-10 sm:py-8">
      <div className="flex items-center justify-between">
        <Link to="/" className="group inline-flex items-center gap-2.5 lg:invisible">
          <LogoMark className="h-9 w-9 shrink-0" />
          <span className="flex flex-col leading-none">
            <span className="text-lg font-extrabold tracking-tight text-slate-900">eLocation</span>
            <span className="mt-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Bénin
            </span>
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Retour à l'accueil</span>
          <span className="sm:hidden">Accueil</span>
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center py-8 sm:py-10">
        <div className={`w-full animate-fade-in ${wide ? 'max-w-xl' : 'max-w-md'}`}>
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-[2rem]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2.5 text-[0.95rem] leading-relaxed text-slate-500">{subtitle}</p>
            )}
          </header>

          {children}

          {footer && <div className="mt-8 text-center text-sm text-slate-500">{footer}</div>}
        </div>
      </div>

      <p className="text-center text-xs text-slate-400">
        © {new Date().getFullYear()} eLocation Bénin ·{' '}
        <Link to="/terms" className="underline-offset-2 transition-colors hover:text-slate-600 hover:underline">
          Conditions d'utilisation
        </Link>
      </p>
    </main>
  </div>
);
