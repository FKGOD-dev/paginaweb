import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  BookOpen, 
  Heart, 
  Star, 
  Trophy, 
  Calendar, 
  Clock,
  Edit,
  Save,
  X,
  Upload,
  Shield,
  Award,
  TrendingUp,
  Eye,
  MessageCircle,
  Share2,
  Crown,
  Flame,
  Target
} from 'lucide-react';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [userStats, setUserStats] = useState({});
  const [userProfile, setUserProfile] = useState({});
  const [favoriteMangas, setFavoriteMangas] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [userLists, setUserLists] = useState([]);

  // Estados para edición
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    location: '',
    website: '',
    favoriteGenres: []
  });

  // Mock data
  const mockUser = {
    id: 1,
    username: "OtakuMaster2024",
    email: "otaku@mangaverse.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
    bio: "Amante del manga y anime desde hace 10 años. Siempre buscando nuevas historias que me emocionen.",
    location: "Tokyo, Japan",
    website: "https://myblog.com",
    level: 25,
    experience: 15750,
    nextLevelXP: 16000,
    role: "user",
    joinDate: "2022-03-15",
    lastActive: "2025-06-16",
    isVerified: true,
    favoriteGenres: ["Shounen", "Acción", "Aventura", "Fantasía"]
  };

  const mockStats = {
    mangasRead: 247,
    chaptersRead: 12580,
    timeSpent: "2,456 horas",
    averageRating: 4.2,
    reviews: 89,
    comments: 1250,
    favorites: 45,
    streak: 15, // días consecutivos leyendo
    ranking: 156 // posición global
  };

  const mockAchievements = [
    {
      id: 1,
      name: "Primer Manga",
      description: "Lee tu primer capítulo",
      icon: "🎯",
      rarity: "common",
      unlockedAt: "2022-03-16",
      progress: 100
    },
    {
      id: 2,
      name: "Maratonista",
      description: "Lee 100 capítulos en un día",
      icon: "🏃",
      rarity: "rare",
      unlockedAt: "2023-08-22",
      progress: 100
    },
    {
      id: 3,
      name: "Crítico Experto",
      description: "Escribe 50 reseñas",
      icon: "📝",
      rarity: "epic",
      unlockedAt: "2024-12-01",
      progress: 100
    },
    {
      id: 4,
      name: "Leyenda Viviente",
      description: "Alcanza nivel 25",
      icon: "👑",
      rarity: "legendary",
      unlockedAt: "2025-06-10",
      progress: 100
    },
    {
      id: 5,
      name: "Coleccionista",
      description: "Agrega 1000 mangas a favoritos",
      icon: "🏆",
      rarity: "epic",
      unlockedAt: null,
      progress: 45 // No desbloqueado aún
    }
  ];

  const mockFavorites = [
    {
      id: 1,
      title: "One Piece",
      cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=200&fit=crop",
      rating: 9.2,
      progress: "Capítulo 1100/1100",
      status: "reading"
    },
    {
      id: 2,
      title: "Attack on Titan",
      cover: "https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=150&h=200&fit=crop",
      rating: 9.0,
      progress: "Completado",
      status: "completed"
    },
    {
      id: 3,
      title: "Solo Leveling",
      cover: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=150&h=200&fit=crop",
      rating: 9.4,
      progress: "Capítulo 45/179",
      status: "reading"
    }
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // Simular carga de datos
    setUserProfile(mockUser);
    setUserStats(mockStats);
    setAchievements(mockAchievements);
    setFavoriteMangas(mockFavorites);
    setEditForm({
      username: mockUser.username,
      bio: mockUser.bio,
      location: mockUser.location,
      website: mockUser.website,
      favoriteGenres: mockUser.favoriteGenres
    });
  };

  const handleEditSubmit = async () => {
    try {
      // API call para actualizar perfil
      setUserProfile(prev => ({
        ...prev,
        ...editForm
      }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getXPPercentage = () => {
    return (userProfile.experience / userProfile.nextLevelXP) * 100;
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'text-gray-400 border-gray-400',
      rare: 'text-blue-400 border-blue-400',
      epic: 'text-purple-400 border-purple-400',
      legendary: 'text-yellow-400 border-yellow-400'
    };
    return colors[rarity] || colors.common;
  };

  const StatCard = ({ icon: Icon, label, value, color = "text-blue-500" }) => (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-white text-2xl font-bold">{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );

  const AchievementCard = ({ achievement }) => (
    <div className={`bg-gray-800 rounded-lg p-4 border-2 ${
      achievement.progress === 100 ? getRarityColor(achievement.rarity) : 'border-gray-600'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`text-3xl ${achievement.progress === 100 ? '' : 'grayscale opacity-50'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold ${
            achievement.progress === 100 ? 'text-white' : 'text-gray-500'
          }`}>
            {achievement.name}
          </h4>
          <p className="text-gray-400 text-sm">{achievement.description}</p>
          {achievement.progress < 100 && (
            <div className="mt-2">
              <div className="bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${achievement.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{achievement.progress}%</p>
            </div>
          )}
          {achievement.unlockedAt && (
            <p className="text-xs text-gray-500 mt-1">
              Desbloqueado: {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header del perfil */}
        <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar y info básica */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.username}
                  className="w-32 h-32 rounded-full border-4 border-white/20"
                />
                {userProfile.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              {/* Nivel y XP */}
              <div className="mt-4 text-center">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <span className="text-lg font-bold">Nivel {userProfile.level}</span>
                </div>
                <div className="w-48 bg-gray-700 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getXPPercentage()}%` }}
                  />
                </div>
                <p className="text-sm text-gray-300">
                  {userProfile.experience?.toLocaleString()} / {userProfile.nextLevelXP?.toLocaleString()} XP
                </p>
              </div>
            </div>

            {/* Información del usuario */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold">{userProfile.username}</h1>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2"
                    placeholder="Nombre de usuario"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 resize-none"
                    rows={3}
                    placeholder="Biografía"
                  />
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2"
                    placeholder="Ubicación"
                  />
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2"
                    placeholder="Sitio web"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditSubmit}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Guardar
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-300">{userProfile.bio}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Se unió: {new Date(userProfile.joinDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Última actividad: {new Date(userProfile.lastActive).toLocaleDateString()}
                    </div>
                    {userProfile.location && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {userProfile.location}
                      </div>
                    )}
                  </div>
                  
                  {/* Géneros favoritos */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {userProfile.favoriteGenres?.map((genre, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-600 rounded-full text-sm">
                        {genre}
                      </span>
                    ))}
                  </div>

                  {/* Estadísticas rápidas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Flame className="w-5 h-5 text-orange-500 mr-1" />
                        <span className="text-xl font-bold">{userStats.streak}</span>
                      </div>
                      <span className="text-gray-400 text-sm">Días seguidos</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Trophy className="w-5 h-5 text-yellow-500 mr-1" />
                        <span className="text-xl font-bold">#{userStats.ranking}</span>
                      </div>
                      <span className="text-gray-400 text-sm">Ranking global</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Star className="w-5 h-5 text-yellow-500 mr-1" />
                        <span className="text-xl font-bold">{userStats.averageRating}</span>
                      </div>
                      <span className="text-gray-400 text-sm">Rating promedio</span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <MessageCircle className="w-5 h-5 text-blue-500 mr-1" />
                        <span className="text-xl font-bold">{userStats.comments}</span>
                      </div>
                      <span className="text-gray-400 text-sm">Comentarios</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Resumen', icon: TrendingUp },
              { id: 'favorites', label: 'Favoritos', icon: Heart },
              { id: 'achievements', label: 'Logros', icon: Award },
              { id: 'stats', label: 'Estadísticas', icon: Target },
              { id: 'settings', label: 'Configuración', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido de las tabs */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Estadísticas principales */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Estadísticas de lectura</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={BookOpen} label="Mangas leídos" value={userStats.mangasRead} />
                    <StatCard icon={Eye} label="Capítulos" value={userStats.chaptersRead?.toLocaleString()} />
                    <StatCard icon={Clock} label="Tiempo total" value={userStats.timeSpent} color="text-green-500" />
                    <StatCard icon={Heart} label="Favoritos" value={userStats.favorites} color="text-red-500" />
                  </div>
                </div>

                {/* Actividad reciente */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Actividad reciente</h3>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-700 rounded">
                        <BookOpen className="w-5 h-5 text-blue-500" />
                        <span>Leyó el capítulo 1100 de <strong>One Piece</strong></span>
                        <span className="text-gray-400 text-sm ml-auto">Hace 2 horas</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-700 rounded">
                        <Heart className="w-5 h-5 text-red-500" />
                        <span>Agregó <strong>Chainsaw Man</strong> a favoritos</span>
                        <span className="text-gray-400 text-sm ml-auto">Hace 5 horas</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-700 rounded">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span>Calificó <strong>Attack on Titan</strong> con 5 estrellas</span>
                        <span className="text-gray-400 text-sm ml-auto">Hace 1 día</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Logros recientes */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Logros recientes</h3>
                  <div className="space-y-3">
                    {achievements.filter(a => a.progress === 100).slice(0, 3).map(achievement => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div>
              <h3 className="text-xl font-bold mb-6">Mangas favoritos ({favoriteMangas.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {favoriteMangas.map(manga => (
                  <div key={manga.id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors">
                    <img
                      src={manga.cover}
                      alt={manga.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                      <h4 className="font-semibold text-sm mb-1 line-clamp-1">{manga.title}</h4>
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs">{manga.rating}</span>
                      </div>
                      <p className="text-xs text-gray-400">{manga.progress}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div>
              <h3 className="text-xl font-bold mb-6">Logros y medallas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-8">
              <h3 className="text-xl font-bold">Estadísticas detalladas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={BookOpen} label="Mangas completados" value="45" />
                <StatCard icon={Eye} label="Mangas en progreso" value="12" />
                <StatCard icon={Clock} label="Mangas en pausa" value="8" />
                <StatCard icon={Star} label="Reseñas escritas" value={userStats.reviews} />
                <StatCard icon={MessageCircle} label="Comentarios totales" value={userStats.comments} />
                <StatCard icon={Share2} label="Contenido compartido" value="23" />
              </div>

              {/* Géneros más leídos */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Géneros más leídos</h4>
                <div className="space-y-3">
                  {[
                    { genre: 'Shounen', count: 89, percentage: 85 },
                    { genre: 'Acción', count: 76, percentage: 72 },
                    { genre: 'Aventura', count: 65, percentage: 62 },
                    { genre: 'Fantasía', count: 43, percentage: 41 },
                    { genre: 'Comedia', count: 32, percentage: 30 }
                  ].map(item => (
                    <div key={item.genre} className="flex items-center justify-between">
                      <span className="text-white">{item.genre}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-gray-400 text-sm w-8">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <h3 className="text-xl font-bold">Configuración de la cuenta</h3>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Información personal</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={userProfile.email}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Zona horaria</label>
                    <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC+9 (Japan Time)</option>
                      <option>UTC+0 (GMT)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Privacidad</h4>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" defaultChecked />
                    <span>Perfil público</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" defaultChecked />
                    <span>Mostrar actividad de lectura</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span>Permitir mensajes de otros usuarios</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-4">Notificaciones</h4>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" defaultChecked />
                    <span>Nuevos capítulos de mis favoritos</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" defaultChecked />
                    <span>Respuestas a mis comentarios</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span>Recomendaciones semanales</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;