// src/components/profile/CompleteUserProfile.jsx
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Edit, 
  Settings, 
  Share2, 
  Flag, 
  Crown, 
  Star, 
  Award, 
  Calendar,
  MapPin,
  Link,
  Heart,
  Eye,
  MessageCircle,
  Users,
  TrendingUp,
  Clock,
  BookOpen,
  Play,
  Zap,
  Trophy,
  Shield,
  Gift,
  Flame,
  Target,
  BarChart3,
  Activity,
  Grid,
  List,
  Filter,
  Search,
  Plus,
  Camera,
  Mail,
  Phone,
  Globe,
  Twitter,
  Instagram,
  Youtube,
  Github,
  ExternalLink,
  Check,
  X,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Bell,
  BellOff,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  Download,
  Upload,
  Bookmark,
  ThumbsUp,
  MessageSquare,
  Coins,
  Gem
} from 'lucide-react';

const CompleteUserProfile = ({ userId, isOwnProfile = false }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  // Mock user data
  const mockUserData = {
    id: userId,
    username: "AnimeExpert2024",
    displayName: "Anime Expert",
    avatar: "/api/placeholder/120/120",
    banner: "/api/placeholder/800/200",
    bio: "Apasionado del anime y manga desde hace más de 10 años. Especialista en shounen y seinen. Siempre buscando nuevas historias que contar.",
    location: "Tokyo, Japan",
    website: "https://myanimeblog.com",
    joinDate: "2020-03-15T00:00:00Z",
    lastActive: "2024-01-15T14:30:00Z",
    verified: true,
    premium: true,
    level: 67,
    xp: 245000,
    rank: 156,
    totalUsers: 50000,
    isPrivate: false,
    
    // Social Stats
    followers: 15420,
    following: 892,
    friends: 234,
    
    // Activity Stats
    animeWatched: 1247,
    episodesWatched: 18543,
    mangaRead: 543,
    chaptersRead: 12890,
    hoursWatched: 15420,
    daysWatched: 642,
    
    // Community Stats
    reviews: 156,
    comments: 2840,
    likes: 12450,
    listsCreated: 23,
    achievementsUnlocked: 89,
    
    // Ratings
    meanScore: 7.8,
    scoreDeviation: 1.2,
    
    // Badges
    badges: [
      { id: 'early_supporter', name: 'Early Supporter', icon: 'crown', rarity: 'legendary', description: 'Miembro desde los primeros días' },
      { id: 'top_reviewer', name: 'Top Reviewer', icon: 'star', rarity: 'epic', description: 'Entre los mejores reseñistas' },
      { id: 'social_butterfly', name: 'Social Butterfly', icon: 'users', rarity: 'rare', description: 'Gran participación en la comunidad' },
      { id: 'marathon_watcher', name: 'Marathon Watcher', icon: 'eye', rarity: 'rare', description: 'Más de 10,000 episodios vistos' },
      { id: 'manga_master', name: 'Manga Master', icon: 'book-open', rarity: 'epic', description: 'Experto en manga' },
      { id: 'verified_critic', name: 'Verified Critic', icon: 'shield', rarity: 'legendary', description: 'Crítico verificado' }
    ],
    
    // Social Links
    socialLinks: {
      twitter: "@animeexpert2024",
      instagram: "animeexpert_official",
      youtube: "AnimeExpertChannel",
      github: "animeexpert2024",
      website: "https://myanimeblog.com"
    },
    
    // Preferences
    favoriteGenres: ["Shounen", "Seinen", "Thriller", "Psychological", "Action"],
    
    // Recent Activity (mock data)
    recentActivity: [
      {
        id: 1,
        type: 'completed',
        content: 'Frieren: Beyond Journey\'s End',
        contentType: 'anime',
        timestamp: '2024-01-15T10:30:00Z',
        rating: 9.5
      },
      {
        id: 2,
        type: 'review',
        content: 'Attack on Titan: The Final Season',
        contentType: 'anime',
        timestamp: '2024-01-14T16:45:00Z',
        likes: 234
      },
      {
        id: 3,
        type: 'list_created',
        content: 'Best Psychological Thrillers 2024',
        contentType: 'list',
        timestamp: '2024-01-13T12:20:00Z',
        items: 15
      }
    ],
    
    // Favorite Content
    favorites: {
      anime: [
        { id: 1, title: "Steins;Gate", image: "/api/placeholder/150/200", score: 10 },
        { id: 2, title: "Monster", image: "/api/placeholder/150/200", score: 9.8 },
        { id: 3, title: "Death Note", image: "/api/placeholder/150/200", score: 9.5 },
        { id: 4, title: "Attack on Titan", image: "/api/placeholder/150/200", score: 9.2 }
      ],
      manga: [
        { id: 5, title: "Berserk", image: "/api/placeholder/150/200", score: 10 },
        { id: 6, title: "20th Century Boys", image: "/api/placeholder/150/200", score: 9.7 },
        { id: 7, title: "Vagabond", image: "/api/placeholder/150/200", score: 9.5 }
      ]
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      // Simulate loading user data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(mockUserData);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} días`;
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'from-gray-500 to-gray-600',
      rare: 'from-blue-500 to-blue-600',
      epic: 'from-purple-500 to-purple-600',
      legendary: 'from-yellow-500 to-orange-500',
      mythic: 'from-pink-500 to-red-500'
    };
    return colors[rarity] || colors.common;
  };

  const getSocialIcon = (platform) => {
    const icons = {
      twitter: Twitter,
      instagram: Instagram,
      youtube: Youtube,
      github: Github,
      website: Globe
    };
    return icons[platform] || ExternalLink;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User size={64} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Usuario no encontrado</h2>
          <p className="text-gray-400">El perfil que buscas no existe o no está disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Banner Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={user.banner}
          alt="Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
        
        {/* Profile Picture and Basic Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
              {/* Profile Picture */}
              <div className="relative">
                <img 
                  src={user.avatar}
                  alt={user.username}
                  className="w-32 h-32 rounded-xl border-4 border-gray-800 object-cover"
                />
                {user.premium && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 p-2 rounded-full">
                    <Crown size={16} className="text-black" />
                  </div>
                )}
                {user.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 p-1 rounded-full">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{user.displayName}</h1>
                  {user.verified && (
                    <Shield size={24} className="text-blue-400" title="Usuario verificado" />
                  )}
                  {user.premium && (
                    <Crown size={24} className="text-yellow-400" title="Usuario premium" />
                  )}
                </div>
                <p className="text-gray-300 text-lg">@{user.username}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                  <span>Nivel {user.level}</span>
                  <span>Ranking #{user.rank}</span>
                  <span>Se unió {formatDate(user.joinDate)}</span>
                  <span>Activo {getTimeAgo(user.lastActive)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {isOwnProfile ? (
                  <>
                    <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                      <Edit size={20} />
                      <span>Editar Perfil</span>
                    </button>
                    <button className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                      <Settings size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                        isFollowing 
                          ? 'bg-gray-700 hover:bg-red-600 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isFollowing ? <UserMinus size={20} /> : <UserPlus size={20} />}
                      <span>{isFollowing ? 'Dejar de seguir' : 'Seguir'}</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                      <MessageCircle size={20} />
                      <span>Mensaje</span>
                    </button>
                    <button className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                      <Share2 size={20} />
                    </button>
                    <button className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation and Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Bio and Info */}
            <div className="bg-gray-800 rounded-xl p-6">
              {user.bio && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Sobre mí</h3>
                  <p className="text-gray-300 leading-relaxed">{user.bio}</p>
                </div>
              )}

              {/* Location and Links */}
              <div className="space-y-3">
                {user.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-gray-300">{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center space-x-3">
                    <Link size={16} className="text-gray-400" />
                    <a 
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {user.website.replace('https://', '')}
                    </a>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-gray-300">Se unió en {formatDate(user.joinDate)}</span>
                </div>
              </div>

              {/* Social Links */}
              {Object.keys(user.socialLinks).length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h4 className="text-white font-medium mb-3">Redes Sociales</h4>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(user.socialLinks).map(([platform, handle]) => {
                      const IconComponent = getSocialIcon(platform);
                      return (
                        <a
                          key={platform}
                          href={platform === 'website' ? handle : `https://${platform}.com/${handle.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-colors"
                        >
                          <IconComponent size={16} />
                          <span className="text-sm">{handle}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Estadísticas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{formatNumber(user.followers)}</div>
                  <div className="text-gray-400 text-sm">Seguidores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{formatNumber(user.following)}</div>
                  <div className="text-gray-400 text-sm">Siguiendo</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{user.animeWatched}</div>
                  <div className="text-gray-400 text-sm">Anime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{user.mangaRead}</div>
                  <div className="text-gray-400 text-sm">Manga</div>
                </div>
              </div>
            </div>

            {/* Favorite Genres */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Géneros Favoritos</h3>
              <div className="flex flex-wrap gap-2">
                {user.favoriteGenres.map(genre => (
                  <span 
                    key={genre}
                    className="px-3 py-1 bg-blue-600/20 text-blue-400 text-sm rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Insignias</h3>
              <div className="grid grid-cols-3 gap-3">
                {user.badges.slice(0, 6).map(badge => (
                  <div 
                    key={badge.id}
                    className={`relative p-3 rounded-lg border-2 bg-gradient-to-br ${getRarityColor(badge.rarity)} border-transparent`}
                    title={badge.description}
                  >
                    <div className="text-center">
                      <Award size={24} className="text-white mx-auto mb-1" />
                      <div className="text-xs text-white font-medium">{badge.name}</div>
                    </div>
                  </div>
                ))}
              </div>
              {user.badges.length > 6 && (
                <button className="w-full mt-3 text-blue-400 hover:text-blue-300 text-sm transition-colors">
                  Ver todas ({user.badges.length})
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Navigation Tabs */}
            <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg overflow-x-auto">
              {[
                { id: 'overview', label: 'Resumen', icon: BarChart3 },
                { id: 'anime', label: 'Anime', icon: Play },
                { id: 'manga', label: 'Manga', icon: BookOpen },
                { id: 'reviews', label: 'Reseñas', icon: Star },
                { id: 'lists', label: 'Listas', icon: List },
                { id: 'activity', label: 'Actividad', icon: Activity },
                { id: 'social', label: 'Social', icon: Users }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <tab.icon size={20} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Level Progress */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Progreso de Nivel</h3>
                    <div className="text-blue-400 font-semibold">Nivel {user.level}</div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                    <div 
                      className="bg-blue-500 rounded-full h-4 transition-all duration-300"
                      style={{ width: '73%' }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{formatNumber(user.xp)} XP</span>
                    <span>Siguiente nivel: 73%</span>
                  </div>
                </div>

                {/* Detailed Stats */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Estadísticas Detalladas</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: 'Episodios Vistos', value: formatNumber(user.episodesWatched), icon: Play, color: 'text-blue-400' },
                      { label: 'Horas Vistas', value: formatNumber(user.hoursWatched), icon: Clock, color: 'text-purple-400' },
                      { label: 'Capítulos Leídos', value: formatNumber(user.chaptersRead), icon: BookOpen, color: 'text-green-400' },
                      { label: 'Reseñas Escritas', value: user.reviews, icon: Star, color: 'text-yellow-400' },
                      { label: 'Comentarios', value: formatNumber(user.comments), icon: MessageCircle, color: 'text-orange-400' },
                      { label: 'Likes Recibidos', value: formatNumber(user.likes), icon: Heart, color: 'text-red-400' },
                      { label: 'Listas Creadas', value: user.listsCreated, icon: List, color: 'text-teal-400' },
                      { label: 'Logros', value: user.achievementsUnlocked, icon: Trophy, color: 'text-yellow-400' }
                    ].map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
                        <stat.icon size={20} className={`${stat.color} mx-auto mt-1`} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Favorites */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Favoritos</h3>
                  
                  {/* Anime Favorites */}
                  <div className="mb-8">
                    <h4 className="text-lg font-medium text-white mb-4">Anime Favoritos</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {user.favorites.anime.map(anime => (
                        <div key={anime.id} className="group cursor-pointer">
                          <div className="relative overflow-hidden rounded-lg">
                            <img 
                              src={anime.image}
                              alt={anime.title}
                              className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-2 left-2 right-2">
                                <div className="flex items-center space-x-1">
                                  <Star className="text-yellow-400 fill-current" size={14} />
                                  <span className="text-white text-sm font-semibold">{anime.score}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <h5 className="text-white font-medium mt-2 text-sm line-clamp-2 group-hover:text-blue-400 transition-colors">
                            {anime.title}
                          </h5>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Manga Favorites */}
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">Manga Favoritos</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {user.favorites.manga.map(manga => (
                        <div key={manga.id} className="group cursor-pointer">
                          <div className="relative overflow-hidden rounded-lg">
                            <img 
                              src={manga.image}
                              alt={manga.title}
                              className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-2 left-2 right-2">
                                <div className="flex items-center space-x-1">
                                  <Star className="text-yellow-400 fill-current" size={14} />
                                  <span className="text-white text-sm font-semibold">{manga.score}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <h5 className="text-white font-medium mt-2 text-sm line-clamp-2 group-hover:text-blue-400 transition-colors">
                            {manga.title}
                          </h5>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Actividad Reciente</h3>
                  <div className="space-y-4">
                    {user.recentActivity.map(activity => (
                      <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === 'completed' ? 'bg-green-600' :
                          activity.type === 'review' ? 'bg-blue-600' :
                          activity.type === 'list_created' ? 'bg-purple-600' :
                          'bg-gray-600'
                        }`}>
                          {activity.type === 'completed' && <Check size={20} className="text-white" />}
                          {activity.type === 'review' && <Star size={20} className="text-white" />}
                          {activity.type === 'list_created' && <List size={20} className="text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-white">
                            {activity.type === 'completed' && `Completó ${activity.content}`}
                            {activity.type === 'review' && `Escribió una reseña de ${activity.content}`}
                            {activity.type === 'list_created' && `Creó la lista "${activity.content}"`}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                            <span>{getTimeAgo(activity.timestamp)}</span>
                            {activity.rating && (
                              <span className="flex items-center space-x-1">
                                <Star size={12} className="text-yellow-400" />
                                <span>{activity.rating}</span>
                              </span>
                            )}
                            {activity.likes && (
                              <span className="flex items-center space-x-1">
                                <Heart size={12} className="text-red-400" />
                                <span>{activity.likes}</span>
                              </span>
                            )}
                            {activity.items && (
                              <span>{activity.items} items</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs would render different content */}
            {activeTab !== 'overview' && (
              <div className="bg-gray-800 rounded-xl p-8 text-center">
                <div className="text-gray-400 mb-4">
                  {activeTab === 'anime' && <Play size={48} className="mx-auto" />}
                  {activeTab === 'manga' && <BookOpen size={48} className="mx-auto" />}
                  {activeTab === 'reviews' && <Star size={48} className="mx-auto" />}
                  {activeTab === 'lists' && <List size={48} className="mx-auto" />}
                  {activeTab === 'activity' && <Activity size={48} className="mx-auto" />}
                  {activeTab === 'social' && <Users size={48} className="mx-auto" />}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h3>
                <p className="text-gray-400">
                  El contenido de {activeTab} se mostraría aquí
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteUserProfile;