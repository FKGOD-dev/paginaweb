// pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { 
  Settings,
  Edit3,
  Camera,
  Calendar,
  MapPin,
  Link,
  Star,
  BookOpen,
  Play,
  MessageCircle,
  Heart,
  Award,
  TrendingUp,
  Users,
  Clock,
  Target,
  Trophy,
  Crown,
  Shield,
  Flame,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Grid,
  List,
  Filter,
  Search,
  Plus,
  Share2,
  MoreHorizontal,
  Github,
  Twitter,
  Instagram,
  Globe
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';

// Componentes que hemos creado anteriormente
import GamificationPanel from '../components/gamification/GamificationPanel';
import { usePagination } from '../components/ui/Pagination';

const UserProfile = ({ userId, isOwnProfile = true }) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  // Datos del usuario simulados
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: userId || 1,
        username: 'OtakuMaster2024',
        displayName: 'Carlos Rodriguez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
        banner: 'https://picsum.photos/1200/300?random=1',
        bio: 'Amante del anime y manga desde hace 15 años. Especialista en shonen y seinen. Siempre buscando nuevas series para recomendar y discutir con la comunidad.',
        joinDate: new Date('2020-03-15'),
        location: 'Buenos Aires, Argentina',
        website: 'https://miportfolio.com',
        socialLinks: {
          twitter: '@otakumaster',
          instagram: 'otaku_master_24',
          github: 'otakumaster'
        },
        level: 25,
        totalXP: 12450,
        currentXP: 650,
        nextLevelXP: 1000,
        rank: 147,
        streak: 23,
        badges: [
          { id: 1, name: 'Crítico Experto', description: 'Escribir 50 reviews', icon: '🏆', rarity: 'gold' },
          { id: 2, name: 'Lector Voraz', description: 'Leer 1000 capítulos', icon: '📚', rarity: 'platinum' },
          { id: 3, name: 'Comentarista Activo', description: '500 comentarios', icon: '💬', rarity: 'silver' },
          { id: 4, name: 'Fan Veterano', description: '3 años en la plataforma', icon: '⭐', rarity: 'bronze' },
          { id: 5, name: 'Descubridor', description: 'Encontrar series ocultas', icon: '🔍', rarity: 'gold' }
        ],
        stats: {
          chaptersRead: 2847,
          episodesWatched: 1456,
          reviewsWritten: 89,
          commentsPosted: 534,
          likesReceived: 2341,
          timeSpent: 486, // horas
          completedSeries: 142,
          droppedSeries: 23,
          onHoldSeries: 15,
          planToWatch: 78,
          favorites: 45,
          lists: 12
        },
        recentActivity: [
          {
            id: 1,
            type: 'review',
            content: 'Escribió una review para "Jujutsu Kaisen"',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            rating: 9
          },
          {
            id: 2,
            type: 'comment',
            content: 'Comentó en "One Piece - Capítulo 1095"',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
          },
          {
            id: 3,
            type: 'achievement',
            content: 'Desbloqueó el logro "Crítico Experto"',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          },
          {
            id: 4,
            type: 'favorite',
            content: 'Agregó "Attack on Titan" a favoritos',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ]
      };

      setUser(mockUser);
      setFollowersCount(Math.floor(Math.random() * 1000) + 100);
      setFollowingCount(Math.floor(Math.random() * 500) + 50);
      setIsFollowing(Math.random() > 0.5);
      setLoading(false);
    };

    loadUserData();
  }, [userId]);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `hace ${days}d`;
    if (hours > 0) return `hace ${hours}h`;
    if (minutes > 0) return `hace ${minutes}m`;
    return 'ahora';
  };

  const getBadgeStyle = (rarity) => {
    const styles = {
      bronze: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300',
      silver: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-300',
      gold: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300',
      platinum: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300'
    };
    return styles[rarity] || styles.bronze;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="h-64 bg-gray-300 dark:bg-gray-700"></div>
        <div className="container mx-auto px-4 -mt-20">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-48"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-64"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Usuario no encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            El perfil que buscas no existe o ha sido eliminado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Banner y Header */}
      <div className="relative">
        {/* Banner */}
        <div 
          className="h-64 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${user.banner})` }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
          {isOwnProfile && (
            <button className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors">
              <Camera className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
                />
                {isOwnProfile && (
                  <button className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
                {/* Online indicator */}
                <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                      {user.displayName}
                      {user.badges.some(b => b.rarity === 'platinum') && (
                        <Crown className="w-6 h-6 text-purple-500" title="Usuario Premium" />
                      )}
                      {user.level >= 30 && (
                        <Shield className="w-6 h-6 text-blue-500" title="Usuario Veterano" />
                      )}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">@{user.username}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Se unió en {user.joinDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                      </div>
                      {user.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {user.location}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 md:mt-0">
                    {!isOwnProfile && (
                      <button
                        onClick={() => setIsFollowing(!isFollowing)}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          isFollowing
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isFollowing ? 'Siguiendo' : 'Seguir'}
                      </button>
                    )}
                    
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                    
                    {isOwnProfile && (
                      <button
                        onClick={() => setEditing(!editing)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.level}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Nivel</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      #{user.rank}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Ranking</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {followersCount}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Seguidores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {followingCount}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Siguiendo</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                      <Flame className="w-5 h-5 text-orange-500" />
                      {user.streak}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Racha</div>
                  </div>
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {user.bio}
                  </p>
                )}

                {/* Links */}
                <div className="flex items-center gap-4">
                  {user.website && (
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
                    >
                      <Link className="w-4 h-4" />
                      Sitio web
                    </a>
                  )}
                  {user.socialLinks.twitter && (
                    <a
                      href={`https://twitter.com/${user.socialLinks.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {user.socialLinks.instagram && (
                    <a
                      href={`https://instagram.com/${user.socialLinks.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-500 hover:text-pink-600 transition-colors"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {user.socialLinks.github && (
                    <a
                      href={`https://github.com/${user.socialLinks.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            <TabsTrigger value="achievements">Logros</TabsTrigger>
            <TabsTrigger value="lists">Listas</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Stats */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Estadísticas Rápidas
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user.stats.chaptersRead.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Capítulos leídos</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <Play className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user.stats.episodesWatched.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Episodios vistos</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user.stats.reviewsWritten}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Reviews escritas</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user.stats.likesReceived.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Likes recibidos</div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Actividad Reciente
                  </h3>
                  <div className="space-y-4">
                    {user.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          {activity.type === 'review' && <Star className="w-4 h-4 text-blue-600" />}
                          {activity.type === 'comment' && <MessageCircle className="w-4 h-4 text-green-600" />}
                          {activity.type === 'achievement' && <Award className="w-4 h-4 text-yellow-600" />}
                          {activity.type === 'favorite' && <Heart className="w-4 h-4 text-red-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-white">{activity.content}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                        {activity.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">{activity.rating}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Gamification Panel */}
                <GamificationPanel />

                {/* Recent Badges */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Logros Recientes
                  </h3>
                  <div className="space-y-3">
                    {user.badges.slice(0, 3).map((badge) => (
                      <div
                        key={badge.id}
                        className={`p-3 rounded-lg border ${getBadgeStyle(badge.rarity)}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{badge.icon}</span>
                          <div>
                            <h4 className="font-medium">{badge.name}</h4>
                            <p className="text-xs opacity-75">{badge.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm">
                    Ver todos los logros →
                  </button>
                </div>

                {/* Time Spent */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Tiempo Dedicado
                  </h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {user.stats.timeSpent}h
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Equivalente a {Math.floor(user.stats.timeSpent / 24)} días
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Anime</span>
                      <span className="font-medium">{Math.floor(user.stats.timeSpent * 0.6)}h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Manga</span>
                      <span className="font-medium">{Math.floor(user.stats.timeSpent * 0.4)}h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Consumption Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Estadísticas de Consumo
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 dark:text-gray-300">Series Completadas</span>
                      <span className="font-bold">{user.stats.completedSeries}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 dark:text-gray-300">En Pausa</span>
                      <span className="font-bold">{user.stats.onHoldSeries}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 dark:text-gray-300">Abandonadas</span>
                      <span className="font-bold">{user.stats.droppedSeries}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 dark:text-gray-300">Plan to Watch</span>
                      <span className="font-bold">{user.stats.planToWatch}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Participación en la Comunidad
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {user.stats.commentsPosted}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Comentarios</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {user.stats.reviewsWritten}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Reviews</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {user.stats.likesReceived}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Likes recibidos</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {user.stats.lists}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Listas creadas</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Todos los Logros ({user.badges.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-lg border-2 ${getBadgeStyle(badge.rarity)} hover:scale-105 transition-transform cursor-pointer`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">{badge.icon}</div>
                      <h4 className="font-bold mb-2">{badge.name}</h4>
                      <p className="text-sm opacity-75">{badge.description}</p>
                      <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-black/10 dark:bg-white/10">
                        {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Lists Tab */}
          <TabsContent value="lists">
            <div className="text-center py-16">
              <List className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Listas de Usuario
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Las listas personalizadas estarán disponibles próximamente
              </p>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="text-center py-16">
              <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Reviews del Usuario
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sistema de reviews estará disponible próximamente
              </p>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Historial de Actividad
              </h3>
              <div className="space-y-4">
                {user.recentActivity.concat(user.recentActivity).map((activity, index) => (
                  <div key={`${activity.id}-${index}`} className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      {activity.type === 'review' && <Star className="w-5 h-5 text-blue-600" />}
                      {activity.type === 'comment' && <MessageCircle className="w-5 h-5 text-green-600" />}
                      {activity.type === 'achievement' && <Award className="w-5 h-5 text-yellow-600" />}
                      {activity.type === 'favorite' && <Heart className="w-5 h-5 text-red-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium">{activity.content}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatTimeAgo(new Date(activity.timestamp.getTime() - index * 60 * 60 * 1000))}
                      </p>
                    </div>
                    {activity.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{activity.rating}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;