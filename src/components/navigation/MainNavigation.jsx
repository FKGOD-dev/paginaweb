// components/navigation/MainNavigation.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen,
  Search,
  Bell,
  Settings,
  User,
  Menu,
  X,
  Sun,
  Moon,
  Home,
  Play,
  Calendar,
  Trophy,
  Users,
  Edit3,
  List,
  TrendingUp,
  Star,
  Heart,
  MessageCircle,
  Bookmark,
  Download,
  HelpCircle,
  LogOut,
  Shield,
  Crown,
  Zap,
  Filter,
  Globe,
  ChevronDown,
  Command,
  Keyboard
} from 'lucide-react';

// Hook para el tema
const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};

// Hook para la búsqueda
const useAdvancedSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchTypes = [
    { value: 'all', label: 'Todo', icon: Globe },
    { value: 'anime', label: 'Anime', icon: Play },
    { value: 'manga', label: 'Manga', icon: BookOpen },
    { value: 'characters', label: 'Personajes', icon: Users },
    { value: 'novels', label: 'Novelas', icon: Edit3 },
    { value: 'users', label: 'Usuarios', icon: User }
  ];

  // Simular búsqueda
  const performSearch = async (query, type = 'all') => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setShowResults(true);

    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 300));

    // Resultados mock
    const mockResults = [
      {
        id: 1,
        type: 'anime',
        title: 'Jujutsu Kaisen',
        subtitle: 'TV • 2020 • MAPPA',
        image: 'https://picsum.photos/100/100?random=1',
        rating: 8.9,
        url: '/anime/1'
      },
      {
        id: 2,
        type: 'manga',
        title: 'One Piece',
        subtitle: 'Manga • 1997 • Eiichiro Oda',
        image: 'https://picsum.photos/100/100?random=2',
        rating: 9.2,
        url: '/manga/2'
      },
      {
        id: 3,
        type: 'character',
        title: 'Monkey D. Luffy',
        subtitle: 'One Piece • Protagonista',
        image: 'https://picsum.photos/100/100?random=3',
        url: '/character/3'
      },
      {
        id: 4,
        type: 'novel',
        title: 'El Héroe Reencarnado',
        subtitle: 'Novela • Fantasy • Usuario123',
        image: 'https://picsum.photos/100/100?random=4',
        rating: 4.5,
        url: '/novel/4'
      },
      {
        id: 5,
        type: 'user',
        title: 'OtakuMaster2024',
        subtitle: 'Nivel 25 • 234 seguidores',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
        url: '/user/otakumaster2024'
      }
    ].filter(result => 
      type === 'all' || result.type === type
    ).filter(result =>
      result.title.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(mockResults);
    setLoading(false);
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      performSearch(searchTerm, searchType);
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, searchType]);

  return {
    searchTerm,
    setSearchTerm,
    searchType,
    setSearchType,
    searchResults,
    loading,
    showResults,
    setShowResults,
    searchTypes
  };
};

// Componente principal de navegación
const MainNavigation = ({ currentUser, onAuthModal, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  
  const { theme, toggleTheme } = useTheme();
  const {
    searchTerm,
    setSearchTerm,
    searchType,
    setSearchType,
    searchResults,
    loading,
    showResults,
    setShowResults,
    searchTypes
  } = useAdvancedSearch();

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Cerrar menús al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K para abrir búsqueda
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
      }
      
      // Escape para cerrar menús
      if (e.key === 'Escape') {
        setShowResults(false);
        setShowUserMenu(false);
        setIsMobileMenuOpen(false);
        setShowKeyboardShortcuts(false);
      }

      // ? para mostrar atajos de teclado
      if (e.key === '?' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigationItems = [
    { id: 'home', label: 'Inicio', icon: Home, href: '/', badge: null },
    { id: 'anime', label: 'Anime', icon: Play, href: '/anime', badge: null },
    { id: 'manga', label: 'Manga', icon: BookOpen, href: '/manga', badge: null },
    { id: 'calendar', label: 'Calendario', icon: Calendar, href: '/calendar', badge: '5' },
    { id: 'ranking', label: 'Ranking', icon: Trophy, href: '/ranking', badge: null },
    { id: 'community', label: 'Comunidad', icon: Users, href: '/community', badge: null },
    { id: 'novels', label: 'Novelas', icon: Edit3, href: '/novels', badge: 'New' },
    { id: 'lists', label: 'Listas', icon: List, href: '/lists', badge: null }
  ];

  const getResultIcon = (type) => {
    const icons = {
      anime: Play,
      manga: BookOpen,
      character: Users,
      novel: Edit3,
      user: User
    };
    const IconComponent = icons[type] || Globe;
    return <IconComponent className="w-4 h-4" />;
  };

  const getResultTypeColor = (type) => {
    const colors = {
      anime: 'text-blue-600',
      manga: 'text-green-600',
      character: 'text-purple-600',
      novel: 'text-orange-600',
      user: 'text-gray-600'
    };
    return colors[type] || 'text-gray-600';
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => onNavigate('/')}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">AnimeVerse</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tu mundo otaku</p>
                </div>
              </div>
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.href)}
                  className="relative flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Search */}
            <div className="flex-1 max-w-md mx-4" ref={searchRef}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => searchTerm && setShowResults(true)}
                  className="block w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Buscar anime, manga, personajes... (Ctrl+K)"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="flex items-center gap-1">
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                      className="text-xs bg-transparent border-none focus:outline-none text-gray-500 dark:text-gray-400"
                    >
                      {searchTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <kbd className="hidden sm:inline-block px-1 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded">
                      ⌘K
                    </kbd>
                  </div>
                </div>

                {/* Search Results */}
                {showResults && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                    {loading ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <>
                        <div className="p-2">
                          {searchResults.map((result) => (
                            <button
                              key={result.id}
                              onClick={() => {
                                onNavigate(result.url);
                                setShowResults(false);
                                setSearchTerm('');
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                            >
                              <img
                                src={result.image}
                                alt={result.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={getResultTypeColor(result.type)}>
                                    {getResultIcon(result.type)}
                                  </span>
                                  <span className="font-medium text-gray-900 dark:text-white truncate">
                                    {result.title}
                                  </span>
                                  {result.rating && (
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                      <span className="text-xs text-gray-500">{result.rating}</span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {result.subtitle}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                          <button
                            onClick={() => {
                              onNavigate(`/search?q=${encodeURIComponent(searchTerm)}&type=${searchType}`);
                              setShowResults(false);
                            }}
                            className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-2"
                          >
                            Ver todos los resultados →
                          </button>
                        </div>
                      </>
                    ) : searchTerm ? (
                      <div className="p-4 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                          No se encontraron resultados para "{searchTerm}"
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {/* Keyboard Shortcuts */}
              <button
                onClick={() => setShowKeyboardShortcuts(true)}
                className="hidden lg:block p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Atajos de teclado"
              >
                <Keyboard className="w-5 h-5" />
              </button>

              {currentUser ? (
                <>
                  {/* Notifications */}
                  <NotificationButton 
                    unreadCount={3}
                    onClick={() => setShowNotifications(!showNotifications)}
                  />

                  {/* User Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.username}
                        className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700"
                      />
                      <div className="hidden md:block text-left">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {currentUser.username}
                          </span>
                          {currentUser.verified && <Crown className="w-3 h-3 text-yellow-500" />}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Nivel {currentUser.level}
                          </span>
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-blue-500" />
                            <span className="text-xs text-blue-600 dark:text-blue-400">
                              {currentUser.xp}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                      <UserDropdownMenu 
                        user={currentUser}
                        onNavigate={onNavigate}
                        onClose={() => setShowUserMenu(false)}
                      />
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={onAuthModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <MobileMenu 
            navigationItems={navigationItems}
            currentUser={currentUser}
            onNavigate={onNavigate}
            onAuthModal={onAuthModal}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        )}
      </header>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowKeyboardShortcuts(false)} />
      )}
    </>
  );
};

// Componente del botón de notificaciones
const NotificationButton = ({ unreadCount, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

// Menú dropdown del usuario
const UserDropdownMenu = ({ user, onNavigate, onClose }) => {
  const menuItems = [
    { 
      section: 'Profile',
      items: [
        { label: 'Mi Perfil', icon: User, href: `/user/${user.username}` },
        { label: 'Mis Listas', icon: List, href: '/my-lists' },
        { label: 'Mis Novelas', icon: Edit3, href: '/my-novels' },
        { label: 'Favoritos', icon: Heart, href: '/favorites' }
      ]
    },
    {
      section: 'Activity', 
      items: [
        { label: 'Historial', icon: Clock, href: '/history' },
        { label: 'Comentarios', icon: MessageCircle, href: '/my-comments' },
        { label: 'Marcadores', icon: Bookmark, href: '/bookmarks' }
      ]
    },
    {
      section: 'Settings',
      items: [
        { label: 'Configuración', icon: Settings, href: '/settings' },
        { label: 'Privacidad', icon: Shield, href: '/privacy' },
        { label: 'Ayuda', icon: HelpCircle, href: '/help' }
      ]
    }
  ];

  return (
    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50">
      {/* User info header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.username}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-900 dark:text-white">
                {user.username}
              </span>
              {user.verified && <Crown className="w-4 h-4 text-yellow-500" />}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Nivel {user.level}
              </span>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-blue-500" />
                <span className="text-blue-600 dark:text-blue-400">
                  {user.xp} XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu items */}
      {menuItems.map((section, sectionIndex) => (
        <div key={section.section}>
          {sectionIndex > 0 && <div className="border-t border-gray-200 dark:border-gray-700 my-2" />}
          <div className="px-2">
            {section.items.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  onNavigate(item.href);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Logout */}
      <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 px-2">
        <button
          onClick={() => {
            // Logout logic here
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

// Menú móvil
const MobileMenu = ({ navigationItems, currentUser, onNavigate, onAuthModal, onClose }) => {
  return (
    <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.href);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {currentUser ? (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {currentUser.username}
                  </span>
                  {currentUser.verified && <Crown className="w-4 h-4 text-yellow-500" />}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Nivel {currentUser.level} • {currentUser.xp} XP
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onNavigate(`/user/${currentUser.username}`);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
                Mi Perfil
              </button>
              <button
                onClick={() => {
                  onNavigate('/settings');
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                Configuración
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => {
                onAuthModal();
                onClose();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Modal de atajos de teclado
const KeyboardShortcutsModal = ({ onClose }) => {
  const shortcuts = [
    { key: 'Ctrl/⌘ + K', description: 'Abrir búsqueda' },
    { key: '?', description: 'Mostrar atajos de teclado' },
    { key: 'Esc', description: 'Cerrar menús/modales' },
    { key: 'F', description: 'Pantalla completa (en lector)' },
    { key: '← →', description: 'Navegar páginas (en lector)' },
    { key: 'C', description: 'Comentarios (en lector)' },
    { key: 'S', description: 'Configuración (en lector)' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Atajos de Teclado
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 <strong>Tip:</strong> Presiona <kbd className="px-1 py-0.5 text-xs bg-blue-200 dark:bg-blue-800 rounded">?</kbd> en cualquier momento para ver estos atajos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainNavigation;
export { useTheme, useAdvancedSearch };