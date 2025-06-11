// src/components/AnimeVerseApp.jsx
import React, { useState, useEffect } from 'react';
import MainNavigation from './navigation/MainNavigation';
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
  Keyboard,
  Plus,
  Eye,
  Clock,
  Tag,
  Award,
  Flame,
  BarChart3,
  Grid,
  Target,
  CheckCircle,
  Radio,
  Tv,
  Share2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Volume2,
  Copy,
  ExternalLink,
  MapPin,
  Link,
  Activity,
  PieChart,
  UserPlus,
  Trash2,
  Archive,
  Flag,
  Info,
  AlertTriangle,
  Send,
  Lock,
  EyeOff,
  Upload,
  Minus,
  Check,
  RefreshCw,
  Image,
  FileText,
  DollarSign
} from 'lucide-react';

// Simular un contexto de usuario
const UserContext = React.createContext();

// Componente principal de la aplicación
const AnimeVerseApp = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showReader, setShowReader] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [appStats, setAppStats] = useState({
    animeCount: 0,
    mangaCount: 0,
    activeUsers: 0,
    novelsCount: 0,
    loading: true
  });

  // Cargar estadísticas reales de la plataforma (simuladas)
  useEffect(() => {
    const loadAppStats = async () => {
      // Simular carga de estadísticas de la API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAppStats({
        animeCount: 47832,
        mangaCount: 156789,
        activeUsers: 89234,
        novelsCount: 4567,
        loading: false
      });
    };

    loadAppStats();
  }, []);

  // Escuchar eventos personalizados para abrir modales
  useEffect(() => {
    const handleOpenAuth = () => setShowAuthModal(true);
    
    window.addEventListener('openAuth', handleOpenAuth);
    return () => window.removeEventListener('openAuth', handleOpenAuth);
  }, []);

  const handleNavigation = (path) => {
    console.log(`Navegando a: ${path}`);
    // Aquí iría la lógica de routing real
    if (path === '/') setCurrentPage('home');
    else if (path.includes('/anime')) setCurrentPage('anime');
    else if (path.includes('/manga')) setCurrentPage('manga');
    else if (path.includes('/calendar')) setCurrentPage('calendar');
    else if (path.includes('/ranking')) setCurrentPage('ranking');
    else if (path.includes('/community')) setCurrentPage('community');
    else if (path.includes('/novels')) setCurrentPage('novels');
    else if (path.includes('/lists')) setCurrentPage('lists');
    else if (path.includes('/user')) setCurrentPage('profile');
    else setCurrentPage('home');
  };

  const addNotification = (notification) => {
    if (!user) return; // Solo agregar notificaciones si hay usuario logueado
    
    setNotifications(prev => [
      { ...notification, id: Date.now(), timestamp: new Date() },
      ...prev
    ]);
  };

  const handleSuccessfulLogin = (userData) => {
    setUser(userData);
    // Simular carga de notificaciones del usuario después del login
    setTimeout(() => {
      setNotifications([
        {
          id: 1,
          title: "¡Bienvenido de vuelta!",
          message: "Tienes nuevos capítulos esperándote",
          timestamp: new Date()
        }
      ]);
    }, 1000);
  };

  return (
    <UserContext.Provider value={{ user, setUser, addNotification }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Navigation */}
        <MainNavigation
          currentUser={user}
          onAuthModal={() => setShowAuthModal(true)}
          onNavigate={handleNavigation}
        />

        {/* Main Content */}
        <main className="transition-all duration-300">
          {currentPage === 'home' && <HomePage onNavigate={handleNavigation} appStats={appStats} />}
          {currentPage === 'anime' && <AnimePage />}
          {currentPage === 'manga' && <MangaPage onOpenReader={() => setShowReader(true)} />}
          {currentPage === 'calendar' && <CalendarPage />}
          {currentPage === 'ranking' && <RankingPage />}
          {currentPage === 'community' && <CommunityPage />}
          {currentPage === 'novels' && <NovelsPage />}
          {currentPage === 'lists' && <ListsPage />}
          {currentPage === 'profile' && <ProfilePage user={user} />}
        </main>

        {/* Modals */}
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} onLogin={handleSuccessfulLogin} />
        )}

        {showReader && (
          <MangaReader onClose={() => setShowReader(false)} />
        )}

        {/* Floating Action Button (FAB) */}
        <FloatingActionButton />

        {/* Toast Notifications - Solo mostrar si hay usuario */}
        {user && <ToastContainer notifications={notifications} />}
      </div>
    </UserContext.Provider>
  );
};

// Página de inicio
const HomePage = ({ onNavigate, appStats }) => {
  const featuredContent = [
    {
      id: 1,
      title: "Jujutsu Kaisen",
      image: "https://picsum.photos/400/600?random=1",
      rating: 8.9,
      description: "La nueva temporada llega con más acción que nunca"
    },
    {
      id: 2,
      title: "One Piece",
      image: "https://picsum.photos/400/600?random=2",
      rating: 9.2,
      description: "El arco de Elbaf promete ser épico"
    }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">Bienvenido a AnimeVerse</h1>
            <p className="text-xl mb-6">Tu plataforma definitiva para anime, manga y novelas ligeras</p>
            <div className="flex gap-4">
              <button 
                onClick={() => onNavigate('/anime')}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Explorar Anime
              </button>
              <button 
                onClick={() => onNavigate('/manga')}
                className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
              >
                Leer Manga
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contenido Destacado</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredContent.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer">
              <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{item.description}</p>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">{item.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Real-time Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {appStats.loading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2 w-2/3"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
              </div>
            </div>
          ))
        ) : (
          // Real stats
          <>
            <StatCard 
              title="Anime Disponibles" 
              value={formatNumber(appStats.animeCount)} 
              icon={<Play className="w-6 h-6 text-blue-600" />} 
            />
            <StatCard 
              title="Capítulos de Manga" 
              value={formatNumber(appStats.mangaCount)} 
              icon={<BookOpen className="w-6 h-6 text-green-600" />} 
            />
            <StatCard 
              title="Usuarios Activos" 
              value={formatNumber(appStats.activeUsers)} 
              icon={<Users className="w-6 h-6 text-purple-600" />} 
            />
            <StatCard 
              title="Novelas Publicadas" 
              value={formatNumber(appStats.novelsCount)} 
              icon={<Edit3 className="w-6 h-6 text-orange-600" />} 
            />
          </>
        )}
      </section>
    </div>
  );
};

// Componente de estadística
const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
};

// Páginas placeholder
const AnimePage = () => (
  <div className="container mx-auto px-4 py-8 text-center">
    <Play className="w-16 h-16 text-blue-600 mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sección de Anime</h2>
    <p className="text-gray-600 dark:text-gray-400">Explora miles de anime con búsqueda avanzada y filtros</p>
  </div>
);

const MangaPage = ({ onOpenReader }) => (
  <div className="container mx-auto px-4 py-8 text-center">
    <BookOpen className="w-16 h-16 text-green-600 mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Biblioteca de Manga</h2>
    <p className="text-gray-600 dark:text-gray-400 mb-6">Lee manga en alta calidad con nuestro lector avanzado</p>
    <button 
      onClick={onOpenReader}
      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
    >
      Abrir Lector de Prueba
    </button>
  </div>
);

const CalendarPage = () => (
  <div className="container mx-auto px-4 py-8 text-center">
    <Calendar className="w-16 h-16 text-purple-600 mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Calendario de Airings</h2>
    <p className="text-gray-600 dark:text-gray-400">Mantente al día con los últimos episodios y estrenos</p>
  </div>
);

const RankingPage = () => (
  <div className="container mx-auto px-4 py-8 text-center">
    <Trophy className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sistema de Rankings</h2>
    <p className="text-gray-600 dark:text-gray-400">Compite con otros usuarios y sube de nivel</p>
  </div>
);

const CommunityPage = () => (
  <div className="container mx-auto px-4 py-8 text-center">
    <Users className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Comunidad Otaku</h2>
    <p className="text-gray-600 dark:text-gray-400">Conecta con fans, comenta y participa en debates</p>
  </div>
);

const NovelsPage = () => (
  <div className="container mx-auto px-4 py-8 text-center">
    <Edit3 className="w-16 h-16 text-red-600 mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Centro de Novelas</h2>
    <p className="text-gray-600 dark:text-gray-400">Escribe, publica y descubre novelas ligeras originales</p>
  </div>
);

const ListsPage = () => (
  <div className="container mx-auto px-4 py-8 text-center">
    <List className="w-16 h-16 text-teal-600 mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Listas Personalizadas</h2>
    <p className="text-gray-600 dark:text-gray-400">Organiza tu contenido favorito en listas temáticas</p>
  </div>
);

const ProfilePage = ({ user }) => {
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acceso Restringido</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Debes iniciar sesión para ver tu perfil
        </p>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('openAuth'))}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <img src={user.avatar} alt={user.username} className="w-24 h-24 rounded-full mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{user.displayName}</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">@{user.username} • Nivel {user.level}</p>
      {user.xp > 0 && (
        <p className="text-sm text-blue-600 dark:text-blue-400">{user.xp} XP</p>
      )}
      {user.verified && (
        <div className="flex items-center justify-center gap-1 mt-2">
          <Crown className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-yellow-600 dark:text-yellow-400">Usuario Verificado</span>
        </div>
      )}
    </div>
  );
};

// Modal de autenticación realista
const AuthModal = ({ onClose, onLogin }) => {
  const [mode, setMode] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos
    if (!formData.email || !formData.password) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    if (mode === 'register' && !formData.username) {
      alert('Por favor ingresa un nombre de usuario');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular llamada a API real con tiempo de espera realista
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular éxito del login/registro
      const userData = {
        id: Date.now(),
        username: formData.username || 'Usuario' + Math.floor(Math.random() * 1000),
        displayName: formData.username || 'Usuario Nuevo',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (formData.username || Date.now()),
        level: 1, // Usuario nuevo comienza en nivel 1
        xp: 0, // Sin XP inicial
        verified: false, // Los nuevos usuarios no están verificados
        followers: 0,
        following: 0
      };
      
      onLogin(userData);
      onClose();
    } catch (error) {
      alert('Error al ' + (mode === 'login' ? 'iniciar sesión' : 'registrarse'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h3>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Nombre de usuario"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
                required
              />
            )}
            
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
              required
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Contraseña"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
              required
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {mode === 'login' ? 'Iniciando sesión...' : 'Creando cuenta...'}
                </>
              ) : (
                mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'
              )}
            </button>
          </div>

          <div className="text-center mt-4">
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-blue-600 hover:text-blue-700 text-sm"
              disabled={isLoading}
            >
              {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
          
          {/* Demo info */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              💡 <strong>Demo:</strong> Puedes usar cualquier email/contraseña para probar la aplicación
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Lector de manga simplificado
const MangaReader = ({ onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 18;

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-40">
        <div className="flex items-center justify-between text-white">
          <div>
            <h1 className="text-xl font-bold">One Piece - Capítulo 1095</h1>
            <p className="text-gray-300">La Última Esperanza</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Página actual */}
      <div className="h-full flex items-center justify-center">
        <img
          src={`https://picsum.photos/800/1200?random=${currentPage}`}
          alt={`Página ${currentPage}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Controles inferiores */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-40">
        <div className="flex items-center justify-between text-white">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">Página {currentPage} de {totalPages}</span>
          </div>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentPage / totalPages) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Botón de acción flotante
const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: Plus, label: 'Nueva Lista', color: 'bg-blue-600' },
    { icon: Edit3, label: 'Escribir Novela', color: 'bg-purple-600' },
    { icon: MessageCircle, label: 'Nuevo Post', color: 'bg-green-600' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-30">
      {/* Acciones secundarias */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`flex items-center gap-3 ${action.color} text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
            >
              <action.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center ${isOpen ? 'rotate-45' : ''}`}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

// Contenedor de notificaciones toast
const ToastContainer = ({ notifications }) => {
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.slice(0, 3).map((notification) => (
        <div
          key={notification.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm animate-slide-in-right"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                {notification.title || 'Nueva notificación'}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {notification.message || 'Tienes una nueva actividad'}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnimeVerseApp;