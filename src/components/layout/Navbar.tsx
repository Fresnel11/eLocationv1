import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Settings, LogOut, ChevronDown, Home, MessageSquare, User, Calendar, Heart, Info, Phone, HelpCircle, LogIn, UserPlus } from 'lucide-react';
// import logoImage from '../../assets/e_location_blank.png';
import { Button } from '../ui/Button';
import { NotificationBell } from '../ui/NotificationBell';
import { useAuth } from '../../context/AuthContext';
// TODO: Messagerie - Import temporaire pour évutter les erreurs
import { useMessages } from '../../context/MessagesContext';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  // TODO: Messagerie - Hook temporaire (retourne toujours 0)
  const { unreadCount } = useMessages();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Console log pour vérifier l'image de profil
  console.log('🔍 Navbar - User data:', user);
  console.log('📸 Navbar - Profile picture:', user?.profilePicture);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
    ];
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-xl shadow-xl sticky top-0 z-50 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center group hover:scale-105 transition-all duration-300">
              {/* <img src={logoImage} alt="eLocation Bénin" className="h-10 w-10 mr-3" /> */}
              <span className="text-3xl font-bold" style={{color: '#2563eb'}}>
                eLocation
              </span>
            </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-3 ml-16">
            <Link 
              to="/ads" 
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                location.pathname === '/ads' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              Annonces
            </Link>

            {user && (
              <>
                <Link 
                  to="/requests" 
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                    location.pathname === '/requests' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  Demandes
                </Link>
                {/* TODO: Messagerie - À implémenter plus tard */}
                {/* <Link 
                  to="/messages" 
                  className={`relative px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                    location.pathname === '/messages' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  Messages
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link> */}
              </>
            )}
            {user && (
              <>
                <Link 
                  to="/bookings" 
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                    location.pathname === '/bookings' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  Réservations
                </Link>
                <Link 
                  to="/favorites" 
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                    location.pathname === '/favorites' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  Favoris
                </Link>
              </>
            )}
            {!user && (
              <>
                <Link 
                  to="/about" 
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                    location.pathname === '/about' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  À propos
                </Link>
                <Link 
                  to="/contact" 
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                    location.pathname === '/contact' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  Contact
                </Link>
                <Link 
                  to="/faq" 
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                    location.pathname === '/faq' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  FAQ
                </Link>
              </>
            )}
          </div>

            <div className="lg:hidden flex items-center space-x-3">
              {user && <NotificationBell />}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-6">
                <NotificationBell />
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(user.firstName + user.lastName)}`}>
                        {getInitials(user.firstName, user.lastName)}
                      </div>
                    )}
                    <span className="text-gray-900 font-medium text-sm whitespace-nowrap">
                      {user.firstName} {user.lastName}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Menu déroulant */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[60]">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500 truncate" title={user.email || user.phone || undefined}>{user.email || user.phone}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigate(`/user/${user.id}`);
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4 mr-3 text-gray-400" />
                        Profil
                      </button>
                      <button
                        onClick={() => {
                          navigate('/settings');
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-3 text-gray-400" />
                        Paramètres
                      </button>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="lg" className="rounded-2xl hover:bg-blue-50 font-semibold" asChild>
                  <Link to="/login">Connexion</Link>
                </Button>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg font-semibold" asChild>
                  <Link to="/register">S'inscrire</Link>
                </Button>
              </div>
            )}
          </div>

          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="lg:hidden fixed top-20 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-xl z-40">
          <div className="px-4 py-4 space-y-3 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <Link 
              to="/ads" 
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                location.pathname === '/ads' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <Home className="h-5 w-5" />
              Annonces
            </Link>

            {user && (
              <>
                <Link 
                  to="/requests" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                    location.pathname === '/requests' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <MessageSquare className="h-5 w-5" />
                  Demandes
                </Link>
                {/* TODO: Messagerie - À implémenter plus tard */}
                {/* <Link 
                  to="/messages" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                    location.pathname === '/messages' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Mail className="h-5 w-5" />
                  Messages
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-auto">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link> */}
                <Link 
                  to="/bookings" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                    location.pathname === '/bookings' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  Réservations
                </Link>
                <Link 
                  to="/favorites" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                    location.pathname === '/favorites' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Heart className="h-5 w-5" />
                  Favoris
                </Link>
              </>
            )}

            {!user && (
              <>
                <Link 
                  to="/about" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                    location.pathname === '/about' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Info className="h-5 w-5" />
                  À propos
                </Link>
                <Link 
                  to="/contact" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                    location.pathname === '/contact' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Phone className="h-5 w-5" />
                  Contact
                </Link>
                <Link 
                  to="/faq" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                    location.pathname === '/faq' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <HelpCircle className="h-5 w-5" />
                  FAQ
                </Link>
              </>
            )}

            <div className="pt-4 border-t border-gray-200">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-3">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(user.firstName + user.lastName)}`}>
                        {getInitials(user.firstName, user.lastName)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-600">Connecté</p>
                    </div>
                  </div>
                  <Link
                    to={`/user/${user.id}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-2xl transition-colors"
                  >
                    <User className="h-5 w-5" />
                    Profil
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-2xl transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                    Paramètres
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Déconnexion
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-colors font-semibold"
                  >
                    <LogIn className="h-5 w-5" />
                    Connexion
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl transition-colors font-semibold"
                  >
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