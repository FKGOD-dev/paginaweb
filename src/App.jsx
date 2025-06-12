// src/App.jsx - AnimeVerse Main Application
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Loader, 
  AlertCircle, 
  Bell, 
  User, 
  Settings,
  Home,
  Search,
  Play,
  BookOpen,
  Calendar,
  Users,
  Award,
  List,
  Heart,
  Star,
  MessageCircle,
  TrendingUp,
  Clock,
  Eye,
  Crown,
  Zap,
  Gift,
  Shield,
  Moon,
  Sun
} from 'lucide-react';

// Import all our components (these would be in separate files in a real app)
// For this demo, we'll simulate the component imports
const MainNavigationSystem = ({ currentUser, onLogin, onLogout, currentPage, onNavigate, notificationCount, darkMode, onToggleDarkMode }) => {
  // Navigation component implementation would go here
  return (
    <header className={`fixed top-0 left-0 right-0 z-40 ${darkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-sm border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('/')}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles size={24} className="text-white" />
            </div>
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>AnimeVerse</h1>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-6">
            {[
              { id: 'home', label: 'Inicio', icon: Home, path: '/' },
              { id: 'anime', label: 'Anime', icon: Play, path: '/anime' },
              { id: 'manga', label: 'Manga', icon: BookOpen, path: '/manga' },
              { id: 'calendar', label: 'Calendario', icon: Calendar, path: '/calendar' },
              { id: 'community', label: 'Comunidad', icon: Users, path: '/community' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                    : darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-3">
                <button className={`relative p-2 rounded-lg transition-colors ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                  <Bell size={20} />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>
                <div className="flex items-center space-x-2">
                  <img src={currentUser.avatar || '/api/placeholder/32/32'} alt={currentUser.username} className="w-8 h-8 rounded-full" />
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{currentUser.username}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-red-400 hover:text-red-300 p-2 rounded-lg transition-colors"
                >
                  Salir
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const HomePage = ({ darkMode }) => (
  <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pt-16`}>
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <Sparkles size={48} className="text-white" />
        </div>
        <h1 className={`text-5xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Bienvenido a AnimeVerse
        </h1>
        <p className={`text-xl mb-12 max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Tu universo completo de anime y manga. Descubre nuevas series, lee manga en alta calidad, conecta con otros otakus y lleva un registro de todo lo que ves y lees.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {[
            { icon: Play, title: 'Miles de Anime', desc: 'Explora y sigue tus series favoritas' },
            { icon: BookOpen, title: 'Lector de Manga', desc: 'Lee manga en alta calidad' },
            { icon: Users, title: 'Comunidad Activa', desc: 'Conecta con otros fans' },
            { icon: Award, title: 'Gamificación', desc: 'Gana XP y desbloquea logros' }
          ].map((feature, index) => (
            <div key={index} className={`p-6 rounded-xl transition-transform hover:scale-105 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon size={32} className="text-white" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {feature.title}
              </h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const LoginRegisterSystem = ({ isOpen, onClose, onSuccess, darkMode }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto bg-gray-800 rounded-2xl shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 flex flex-col justify-center">
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Sparkles size={24} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">AnimeVerse</h1>
              </div>
              <p className="text-blue-100 text-lg leading-relaxed mb-8">
                Únete a la comunidad más grande de anime y manga
              </p>
              <div className="space-y-4">
                {[
                  { icon: Play, title: 'Miles de anime', desc: 'Descubre y sigue tus series favoritas' },
                  { icon: BookOpen, title: 'Lector de manga', desc: 'Lee manga en alta calidad' },
                  { icon: Users, title: 'Comunidad activa', desc: 'Conecta con otros otakus' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-4 text-white">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <feature.icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-blue-100 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-white mb-6">Iniciar Sesión</h2>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  onSuccess({
                    user: {
                      id: 1,
                      username: 'demo_user',
                      displayName: 'Usuario Demo',
                      avatar: '/api/placeholder/40/40',
                      level: 25,
                      xp: 12500
                    },
                    token: 'demo-token'
                  });
                  onClose();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Iniciar Sesión (Demo)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingScreen = ({ darkMode }) => (
  <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Sparkles size={32} className="text-white" />
      </div>
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Cargando AnimeVerse...</p>
    </div>
  </div>
);

const ErrorBoundary = ({ error, onRetry, darkMode }) => (
  <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
    <div className="text-center max-w-md mx-auto p-6">
      <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={32} className="text-red-400" />
      </div>
      <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        ¡Oops! Algo salió mal
      </h2>
      <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
      </p>
      <button
        onClick={onRetry}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Reintentar
      </button>
    </div>
  </div>
);

const AnimeVerse = () => {
  // Global State
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Load user preferences
        const savedTheme = localStorage.getItem('animeverse-theme');
        if (savedTheme) {
          setDarkMode(savedTheme === 'dark');
        }

        // Check for existing session
        const savedUser = localStorage.getItem('animeverse-user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setCurrentUser(userData);
          setNotificationCount(Math.floor(Math.random() * 10)); // Mock notifications
        }

        // Simulate initialization delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err);
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('animeverse-theme', darkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Navigation handler
  const handleNavigate = useCallback((path) => {
    const pathToPageMap = {
      '/': 'home',
      '/anime': 'anime',
      '/manga': 'manga',
      '/calendar': 'calendar',
      '/community': 'community',
      '/search': 'search',
      '/profile': 'profile',
      '/settings': 'settings'
    };
    
    const page = pathToPageMap[path] || 'home';
    setCurrentPage(page);
    
    // In a real app, this would integrate with React Router
    window.history.pushState({}, '', path);
  }, []);

  // Authentication handlers
  const handleLogin = useCallback(() => {
    setShowLogin(true);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setNotificationCount(0);
    localStorage.removeItem('animeverse-user');
    setCurrentPage('home');
    handleNavigate('/');
  }, [handleNavigate]);

  const handleLoginSuccess = useCallback((authData) => {
    setCurrentUser(authData.user);
    setNotificationCount(Math.floor(Math.random() * 10));
    localStorage.setItem('animeverse-user', JSON.stringify(authData.user));
    setShowLogin(false);
  }, []);

  // Theme toggle
  const handleToggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  // Error retry
  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    window.location.reload();
  }, []);

  // Render loading state
  if (loading) {
    return <LoadingScreen darkMode={darkMode} />;
  }

  // Render error state
  if (error) {
    return <ErrorBoundary error={error} onRetry={handleRetry} darkMode={darkMode} />;
  }

  // Main app render
  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navigation */}
      <MainNavigationSystem
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        notificationCount={notificationCount}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Main Content */}
      <main className="transition-all duration-300">
        {currentPage === 'home' && (
          <HomePage darkMode={darkMode} />
        )}
        
        {currentPage === 'anime' && (
          <div className={`min-h-screen pt-16 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto p-6">
              <div className="text-center py-20">
                <Play size={64} className={`mx-auto mb-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Sección de Anime
                </h1>
                <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Explora miles de anime y descubre tus próximas series favoritas
                </p>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'manga' && (
          <div className={`min-h-screen pt-16 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto p-6">
              <div className="text-center py-20">
                <BookOpen size={64} className={`mx-auto mb-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Lector de Manga
                </h1>
                <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Lee manga en alta calidad con nuestro lector avanzado
                </p>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'calendar' && (
          <div className={`min-h-screen pt-16 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto p-6">
              <div className="text-center py-20">
                <Calendar size={64} className={`mx-auto mb-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Calendario de Anime
                </h1>
                <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Mantente al día con los horarios de emisión
                </p>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'community' && (
          <div className={`min-h-screen pt-16 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto p-6">
              <div className="text-center py-20">
                <Users size={64} className={`mx-auto mb-6 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Comunidad
                </h1>
                <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Conecta con otros otakus y comparte tus opiniones
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add other pages as needed */}
      </main>

      {/* Login Modal */}
      <LoginRegisterSystem
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
        darkMode={darkMode}
      />

      {/* Notification Badge */}
      {currentUser && notificationCount > 0 && (
        <div className="fixed bottom-6 right-6 z-30">
          <div className={`p-4 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <Bell size={20} className="text-blue-400" />
              <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Tienes {notificationCount} notificaciones nuevas
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Development Info (remove in production) */}
      <div className="fixed bottom-4 left-4 z-20">
        <div className={`p-3 rounded-lg text-xs ${darkMode ? 'bg-gray-800/80 text-gray-400' : 'bg-white/80 text-gray-600'} backdrop-blur-sm`}>
          <div>Usuario: {currentUser ? currentUser.username : 'No logueado'}</div>
          <div>Página: {currentPage}</div>
          <div>Tema: {darkMode ? 'Oscuro' : 'Claro'}</div>
          <div>Notificaciones: {notificationCount}</div>
        </div>
      </div>
    </div>
  );
};

export default AnimeVerse;