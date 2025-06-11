// src/components/gamification/EnhancedGamificationSystem.jsx
import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Crown, 
  Zap, 
  Target, 
  Gift, 
  Flame, 
  Award, 
  TrendingUp,
  Calendar,
  Clock,
  Users,
  Heart,
  MessageCircle,
  BookOpen,
  Eye,
  ThumbsUp,
  Share2,
  CheckCircle,
  Lock,
  Sparkles,
  Gem,
  Shield,
  Medal,
  Plus,
  ArrowUp,
  BarChart3,
  Coins,
  Timer,
  Activity
} from 'lucide-react';

const EnhancedGamificationSystem = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data para el sistema de gamificación
  const mockUserStats = {
    level: 47,
    xp: 23750,
    xpToNextLevel: 25000,
    totalXp: 123750,
    rank: 156,
    totalUsers: 50000,
    streakDays: 23,
    maxStreak: 45,
    points: 8950,
    badges: [
      { id: 'early_bird', name: 'Madrugador', icon: 'sun', rarity: 'common', unlocked: true },
      { id: 'social_butterfly', name: 'Mariposa Social', icon: 'users', rarity: 'rare', unlocked: true },
      { id: 'critic', name: 'Crítico Experto', icon: 'star', rarity: 'epic', unlocked: true },
      { id: 'marathon_watcher', name: 'Maratonista', icon: 'eye', rarity: 'legendary', unlocked: true },
      { id: 'theory_master', name: 'Maestro de Teorías', icon: 'zap', rarity: 'mythic', unlocked: false }
    ],
    weeklyActivity: {
      anime_watched: 12,
      manga_read: 8,
      comments_posted: 25,
      likes_given: 67,
      reviews_written: 3
    },
    monthlyGoals: {
      anime_episodes: { current: 45, target: 60, reward: 500 },
      manga_chapters: { current: 120, target: 150, reward: 300 },
      social_interactions: { current: 180, target: 200, reward: 400 }
    }
  };

  const mockAchievements = [
    {
      id: 1,
      name: "Primera Reseña",
      description: "Escribe tu primera reseña de anime o manga",
      icon: "edit",
      category: "social",
      rarity: "common",
      xpReward: 100,
      pointsReward: 50,
      unlocked: true,
      unlockedAt: "2024-01-10T10:00:00Z",
      progress: 1,
      maxProgress: 1
    },
    {
      id: 2,
      name: "Crítico Prolífico",
      description: "Escribe 50 reseñas",
      icon: "star",
      category: "social",
      rarity: "epic",
      xpReward: 1000,
      pointsReward: 500,
      unlocked: true,
      unlockedAt: "2024-01-15T14:30:00Z",
      progress: 50,
      maxProgress: 50
    },
    {
      id: 3,
      name: "Maratonista Legendario",
      description: "Ve 100 episodios en una semana",
      icon: "eye",
      category: "watching",
      rarity: "legendary",
      xpReward: 2500,
      pointsReward: 1000,
      unlocked: false,
      progress: 67,
      maxProgress: 100
    },
    {
      id: 4,
      name: "Conectando Corazones",
      description: "Recibe 1000 likes en tus comentarios",
      icon: "heart",
      category: "social",
      rarity: "rare",
      xpReward: 500,
      pointsReward: 250,
      unlocked: false,
      progress: 342,
      maxProgress: 1000
    }
  ];

  const mockLeaderboard = [
    { rank: 1, username: "AnimeKing2024", level: 89, xp: 245000, avatar: "/api/placeholder/40/40", badge: "crown" },
    { rank: 2, username: "MangaMaster", level: 82, xp: 198000, avatar: "/api/placeholder/40/40", badge: "medal" },
    { rank: 3, username: "OtakuLegend", level: 78, xp: 167000, avatar: "/api/placeholder/40/40", badge: "trophy" },
    { rank: 4, username: "AnimeCritic", level: 72, xp: 145000, avatar: "/api/placeholder/40/40", badge: "star" },
    { rank: 5, username: "TheoryMaster", level: 69, xp: 134000, avatar: "/api/placeholder/40/40", badge: "zap" },
    { rank: 156, username: "TuUsuario", level: 47, xp: 123750, avatar: "/api/placeholder/40/40", badge: "user", isCurrentUser: true }
  ];

  const mockDailyTasks = [
    {
      id: 1,
      name: "Ve 2 episodios",
      description: "Mira 2 episodios de cualquier anime",
      icon: "play",
      xpReward: 50,
      pointsReward: 25,
      progress: 1,
      maxProgress: 2,
      completed: false,
      category: "watching"
    },
    {
      id: 2,
      name: "Comenta en 3 discusiones",
      description: "Participa en discusiones de la comunidad",
      icon: "message-circle",
      xpReward: 75,
      pointsReward: 35,
      progress: 3,
      maxProgress: 3,
      completed: true,
      category: "social"
    },
    {
      id: 3,
      name: "Lee 5 capítulos de manga",
      description: "Disfruta leyendo manga",
      icon: "book-open",
      xpReward: 40,
      pointsReward: 20,
      progress: 2,
      maxProgress: 5,
      completed: false,
      category: "reading"
    },
    {
      id: 4,
      name: "Da 10 likes",
      description: "Apoya a otros miembros de la comunidad",
      icon: "thumbs-up",
      xpReward: 30,
      pointsReward: 15,
      progress: 7,
      maxProgress: 10,
      completed: false,
      category: "social"
    }
  ];

  const mockRewards = [
    {
      id: 1,
      name: "Avatar Exclusivo: Dragón Dorado",
      description: "Un avatar único que muestra tu estatus elite",
      cost: 2000,
      type: "avatar",
      rarity: "legendary",
      owned: false,
      category: "cosmetic"
    },
    {
      id: 2,
      name: "Título: Maestro del Anime",
      description: "Muestra este título prestigioso en tu perfil",
      cost: 1500,
      type: "title",
      rarity: "epic",
      owned: true,
      category: "cosmetic"
    },
    {
      id: 3,
      name: "Marco de Perfil: Llama Azul",
      description: "Un marco animado para tu foto de perfil",
      cost: 800,
      type: "frame",
      rarity: "rare",
      owned: false,
      category: "cosmetic"
    },
    {
      id: 4,
      name: "Boost XP x2 (1 día)",
      description: "Duplica todo el XP ganado durante 24 horas",
      cost: 500,
      type: "boost",
      rarity: "common",
      owned: false,
      category: "functional"
    }
  ];

  useEffect(() => {
    loadGamificationData();
  }, [userId]);

  const loadGamificationData = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUserStats(mockUserStats);
      setAchievements(mockAchievements);
      setLeaderboard(mockLeaderboard);
      setDailyTasks(mockDailyTasks);
      setRewards(mockRewards);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
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

  const getIconComponent = (iconName) => {
    const icons = {
      trophy: Trophy,
      star: Star,
      crown: Crown,
      zap: Zap,
      heart: Heart,
      eye: Eye,
      'message-circle': MessageCircle,
      'book-open': BookOpen,
      'thumbs-up': ThumbsUp,
      edit: Award,
      play: Eye,
      user: Users
    };
    return icons[iconName] || Star;
  };

  const calculateLevelProgress = () => {
    if (!userStats) return 0;
    return (userStats.xp / userStats.xpToNextLevel) * 100;
  };

  const formatXP = (xp) => {
    if (xp >= 1000000) {
      return `${(xp / 1000000).toFixed(1)}M`;
    } else if (xp >= 1000) {
      return `${(xp / 1000).toFixed(1)}K`;
    }
    return xp.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando sistema de gamificación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con stats principales */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Nivel y XP */}
          <div className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold">Nivel {userStats.level}</h2>
                <p className="text-blue-100">
                  {formatXP(userStats.xp)} / {formatXP(userStats.xpToNextLevel)} XP
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">#{userStats.rank}</div>
                <div className="text-blue-100">de {userStats.totalUsers.toLocaleString()}</div>
              </div>
            </div>
            <div className="w-full bg-blue-500/30 rounded-full h-3 mb-2">
              <div 
                className="bg-white rounded-full h-3 transition-all duration-300"
                style={{ width: `${calculateLevelProgress()}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-blue-100">
              <span>{Math.round(calculateLevelProgress())}% al siguiente nivel</span>
              <span>{formatXP(userStats.xpToNextLevel - userStats.xp)} XP restante</span>
            </div>
          </div>

          {/* Racha */}
          <div className="bg-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <Flame size={32} className="mb-2" />
                <h3 className="text-xl font-semibold">Racha</h3>
                <p className="text-orange-100">{userStats.streakDays} días</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-orange-200">Récord</div>
                <div className="text-lg font-bold">{userStats.maxStreak}</div>
              </div>
            </div>
          </div>

          {/* Puntos */}
          <div className="bg-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <Coins size={32} className="mb-2" />
                <h3 className="text-xl font-semibold">Puntos</h3>
                <p className="text-green-100">{userStats.points.toLocaleString()}</p>
              </div>
              <button className="bg-green-500 hover:bg-green-400 px-3 py-1 rounded-lg text-sm transition-colors">
                Canjear
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg w-fit">
          {[
            { id: 'overview', label: 'Resumen', icon: BarChart3 },
            { id: 'achievements', label: 'Logros', icon: Trophy },
            { id: 'leaderboard', label: 'Rankings', icon: Crown },
            { id: 'tasks', label: 'Tareas Diarias', icon: Target },
            { id: 'rewards', label: 'Recompensas', icon: Gift }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
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

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Actividad Semanal */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Actividad Semanal</h3>
              <div className="space-y-4">
                {Object.entries(userStats.weeklyActivity).map(([key, value]) => {
                  const labels = {
                    anime_watched: 'Anime visto',
                    manga_read: 'Manga leído',
                    comments_posted: 'Comentarios',
                    likes_given: 'Likes dados',
                    reviews_written: 'Reseñas escritas'
                  };
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-300">{labels[key]}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                            style={{ width: `${Math.min((value / 20) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-white font-semibold w-8 text-right">{value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Objetivos Mensuales */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Objetivos Mensuales</h3>
              <div className="space-y-6">
                {Object.entries(userStats.monthlyGoals).map(([key, goal]) => {
                  const labels = {
                    anime_episodes: 'Episodios de Anime',
                    manga_chapters: 'Capítulos de Manga',
                    social_interactions: 'Interacciones Sociales'
                  };
                  const progress = (goal.current / goal.target) * 100;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300">{labels[key]}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-white">{goal.current}/{goal.target}</span>
                          <Coins size={16} className="text-yellow-400" />
                          <span className="text-yellow-400">{goal.reward}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className={`rounded-full h-3 transition-all duration-300 ${
                            progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                      {progress >= 100 && (
                        <div className="flex items-center space-x-2 mt-2">
                          <CheckCircle size={16} className="text-green-400" />
                          <span className="text-green-400 text-sm">¡Objetivo completado!</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Badges Desbloqueadas */}
            <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Insignias Desbloqueadas</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {userStats.badges.map(badge => (
                  <div 
                    key={badge.id}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                      badge.unlocked 
                        ? `bg-gradient-to-br ${getRarityColor(badge.rarity)} border-transparent` 
                        : 'bg-gray-700 border-gray-600 opacity-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                        badge.unlocked ? 'bg-white/20' : 'bg-gray-600'
                      }`}>
                        {badge.unlocked ? (
                          <Crown size={24} className="text-white" />
                        ) : (
                          <Lock size={24} className="text-gray-400" />
                        )}
                      </div>
                      <h4 className={`font-semibold text-sm ${
                        badge.unlocked ? 'text-white' : 'text-gray-400'
                      }`}>
                        {badge.name}
                      </h4>
                      <span className={`text-xs capitalize ${
                        badge.unlocked ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {badge.rarity}
                      </span>
                    </div>
                    {!badge.unlocked && (
                      <Lock size={16} className="absolute top-2 right-2 text-gray-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map(achievement => {
              const IconComponent = getIconComponent(achievement.icon);
              const progress = (achievement.progress / achievement.maxProgress) * 100;
              
              return (
                <div 
                  key={achievement.id}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    achievement.unlocked 
                      ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} border-transparent` 
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                      achievement.unlocked ? 'bg-white/20' : 'bg-gray-700'
                    }`}>
                      {achievement.unlocked ? (
                        <IconComponent size={32} className="text-white" />
                      ) : (
                        <Lock size={32} className="text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-lg font-semibold ${
                          achievement.unlocked ? 'text-white' : 'text-gray-300'
                        }`}>
                          {achievement.name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                          achievement.unlocked ? 'bg-white/20 text-white' : 'bg-gray-700 text-gray-400'
                        }`}>
                          {achievement.rarity}
                        </span>
                      </div>
                      
                      <p className={`text-sm mb-4 ${
                        achievement.unlocked ? 'text-white/80' : 'text-gray-400'
                      }`}>
                        {achievement.description}
                      </p>
                      
                      {!achievement.unlocked && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-400 mb-1">
                            <span>Progreso</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Zap size={16} className="text-blue-400" />
                          <span className={achievement.unlocked ? 'text-white' : 'text-gray-400'}>
                            {achievement.xpReward} XP
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Coins size={16} className="text-yellow-400" />
                          <span className={achievement.unlocked ? 'text-white' : 'text-gray-400'}>
                            {achievement.pointsReward} puntos
                          </span>
                        </div>
                      </div>
                      
                      {achievement.unlocked && achievement.unlockedAt && (
                        <div className="mt-2 text-xs text-white/60">
                          Desbloqueado: {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Ranking Global</h3>
            <div className="space-y-4">
              {leaderboard.map(user => {
                const IconComponent = getIconComponent(user.badge);
                return (
                  <div 
                    key={user.rank}
                    className={`flex items-center space-x-4 p-4 rounded-lg transition-colors ${
                      user.isCurrentUser 
                        ? 'bg-blue-600/20 border border-blue-500/30' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      user.rank === 1 ? 'bg-yellow-500 text-black' :
                      user.rank === 2 ? 'bg-gray-400 text-black' :
                      user.rank === 3 ? 'bg-orange-500 text-black' :
                      'bg-gray-600 text-white'
                    }`}>
                      {user.rank}
                    </div>
                    
                    <img 
                      src={user.avatar} 
                      alt={user.username}
                      className="w-12 h-12 rounded-full"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className={`font-semibold ${
                          user.isCurrentUser ? 'text-blue-400' : 'text-white'
                        }`}>
                          {user.username}
                        </h4>
                        <IconComponent size={16} className="text-yellow-400" />
                      </div>
                      <p className="text-gray-400 text-sm">Nivel {user.level}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white font-semibold">{formatXP(user.xp)} XP</div>
                      <div className="text-gray-400 text-sm">Total</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dailyTasks.map(task => {
              const IconComponent = getIconComponent(task.icon);
              const progress = (task.progress / task.maxProgress) * 100;
              
              return (
                <div 
                  key={task.id}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    task.completed 
                      ? 'bg-green-600/20 border-green-500/30' 
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      task.completed ? 'bg-green-500' : 'bg-gray-700'
                    }`}>
                      {task.completed ? (
                        <CheckCircle size={24} className="text-white" />
                      ) : (
                        <IconComponent size={24} className="text-gray-300" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-2 ${
                        task.completed ? 'text-green-400' : 'text-white'
                      }`}>
                        {task.name}
                      </h3>
                      
                      <p className="text-gray-400 text-sm mb-4">
                        {task.description}
                      </p>
                      
                      {!task.completed && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-400 mb-1">
                            <span>Progreso</span>
                            <span>{task.progress}/{task.maxProgress}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Zap size={16} className="text-blue-400" />
                          <span className={task.completed ? 'text-green-400' : 'text-gray-400'}>
                            {task.xpReward} XP
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Coins size={16} className="text-yellow-400" />
                          <span className={task.completed ? 'text-green-400' : 'text-gray-400'}>
                            {task.pointsReward} puntos
                          </span>
                        </div>
                      </div>
                      
                      {task.completed && (
                        <div className="mt-2 flex items-center space-x-2">
                          <CheckCircle size={16} className="text-green-400" />
                          <span className="text-green-400 text-sm">¡Completado!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map(reward => (
              <div key={reward.id} className="bg-gray-800 rounded-xl p-6 border-2 border-gray-700">
                <div className={`w-full h-32 bg-gradient-to-br ${getRarityColor(reward.rarity)} rounded-lg mb-4 flex items-center justify-center`}>
                  <Gift size={48} className="text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">{reward.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{reward.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs px-2 py-1 rounded-full capitalize bg-gray-700 text-gray-300`}>
                    {reward.rarity}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Coins size={16} className="text-yellow-400" />
                    <span className="text-white font-semibold">{reward.cost}</span>
                  </div>
                </div>
                
                <button 
                  disabled={reward.owned || userStats.points < reward.cost}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    reward.owned 
                      ? 'bg-green-600 text-white cursor-not-allowed' :
                    userStats.points >= reward.cost
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {reward.owned ? 'Ya Obtenido' : 
                   userStats.points >= reward.cost ? 'Canjear' : 'Puntos Insuficientes'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedGamificationSystem;