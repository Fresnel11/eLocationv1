import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
import logoImage from '../../assets/e_location.png';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-200 border-t border-slate-800/80 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Description */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center mb-4">
              <img src={logoImage} alt="eLocation Bénin" className="h-9 w-9 object-contain mr-3 filter drop-shadow-md" />
              <h3 className="font-extrabold text-xl text-white tracking-tight">eLocation Bénin</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-md">
              La plateforme digitale d'excellence pour louer en toute sérénité au Bénin. Nous connectons locataires et propriétaires grâce à des garanties de sécurité éprouvées.
            </p>
            <div className="flex space-x-3">
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all duration-200 shadow-sm">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-pink-600 hover:border-pink-500 transition-all duration-200 shadow-sm">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-700 hover:border-blue-600 transition-all duration-200 shadow-sm">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="font-bold text-white text-base mb-5 tracking-wide uppercase text-xs text-blue-400">Navigation</h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link to="/ads" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Toutes les annonces
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors duration-200">
                  À propos de nous
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Questions fréquentes
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Nous contacter
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white text-base mb-5 tracking-wide uppercase text-xs text-blue-400">Contact & Support</h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-center space-x-3 text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-blue-400" />
                </div>
                <span>+229 01 99 15 46 78</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-blue-400" />
                </div>
                <span className="truncate">elocationcontact@gmail.com</span>
              </li>
              <li className="flex items-start space-x-3 text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-blue-400" />
                </div>
                <span>Cotonou, République du Bénin</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 eLocation Bénin. Tous droits réservés.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link to="/terms" className="hover:text-slate-400 transition-colors">Conditions Générales</Link>
            <Link to="/faq" className="hover:text-slate-400 transition-colors">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};