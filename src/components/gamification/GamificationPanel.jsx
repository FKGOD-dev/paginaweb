// components/gamification/GamificationPanel.jsx
import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Trophy, 
  Star, 
  Flame, 
  Target, 
  Award, 
  TrendingUp,
  Book,
  MessageCircle,
  Heart,
  Eye,
  Calendar,
  Zap
} from 'lucide-react';

// Hook para manejar el sistema de puntos
export const useGamification = () => {
  const [userStats, setUserStats] = useState({
    level: 1,
    currentXP: 150,
    nextLevelXP: 250,
    totalXP: 150,
    streak: 7,
    badges: [],
    rank: 'Otaku Novato',
    achievements: []
  });

  // Acciones que dan XP
  const XP_REWARDS = {
    READ_CHAPTER: 5,
    WRITE_REVIEW: 25,
    COMMENT: 10,
    LIKE_CONTENT: 2,
    ADD_TO_LIST: 5,
    COMPLETE_SERIES: 50,
    DAILY_LOGIN: 10,
    SHARE_CONTENT: 15
  };

  const addXP = (action, amount = null) => {
    const xpGained = amount || XP_REWARDS[action] || 0;
    
    setUserStats(prev => {
      const newTotalXP = prev.totalXP + xpGained;
      const newCurrentXP = prev.currentXP + xpGained;
      
      let newLevel = prev.level;
      let newNextLevelXP = prev.nextLevelXP;
      
      // Calcular nuevo nivel si es necesario
      if (newCurrentXP >= prev.nextLevelXP) {
        newLevel += 1;
        newNextLevelXP = newLevel * 250; // Cada nivel requiere más XP
      }
      
      return {
        ...prev,
        currentXP: newCurrentXP >= prev.nextLevelXP ? newCurrentXP - prev.nextLevelXP : newCurrentXP,
        totalXP: newTotalXP,
        level: newLevel,
        nextLevelXP: newNextLevelXP
      };
    });
    
    return xpGained;
  };

  return { userStats, addXP, XP_REWARDS };
};

// Componente principal del panel de gamificación
const GamificationPanel = ({ className = '' }) => {
  const { userStats, addXP } = useGamification();
  const [showRewards, setShowRewards] = useState(false);

  // Calcular porcentaje de progreso al siguiente nivel
  const progressPercentage = (userStats.currentXP / userStats.nextLevelXP) * 100;

  // Rangos por nivel
  const getRankInfo = (level) => {
    if (level >= 50) return { name: 'Leyenda del Anime', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' };
    if (level >= 30) return { name: 'Maestro Otaku', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' };
    if (level >= 20) return { name: 'Crítico Experto', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' };
    if (level >= 10) return { name: 'Fan Dedicado', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' };
    if (level >= 5) return { name: 'Explorador', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' };
    return { name: 'Otaku Novato', color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-700' };
  };

  const rankInfo = getRankInfo(userStats.level);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header con nivel y rango */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Nivel {userStats.level}</h3>
              <p className="text-blue-100">{rankInfo.name}</p>
            </div>
          </div>
          
          {/* Streak */}
          <div className="text-center">
            <div className="flex items-center gap-1 mb-1">
              <Flame className="w-5 h-5 text-orange-300" />
              <span className="text-2xl font-bold">{userStats.streak}</span>
            </div>
            <p className="text-xs text-blue-100">días seguidos</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>XP: {userStats.currentXP}</span>
            <span>Siguiente nivel: {userStats.nextLevelXP}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full mx-auto mb-2 flex items-center justify-center">
              <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">247</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Capítulos leídos</p>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-2 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">89</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Comentarios</p>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-2 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">156</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Favoritos</p>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full mx-auto mb-2 flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">34</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Reviews</p>
          </div>
        </div>

        {/* Logros recientes */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-600" />
            Logros Recientes
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">Primera Review</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">+25 XP</p>
              </div>
              <span className="text-xs text-gray-400">Hace 2h</span>
            </div>
            
            <div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Flame className="w-6 h-6 text-orange-500" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">Racha de 7 días</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">+50 XP</p>
              </div>
              <span className="text-xs text-gray-400">Hoy</span>
            </div>
          </div>
        </div>

        {/* Acciones rápidas para ganar XP */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-green-600" />
            Gana XP Ahora
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => addXP('READ_CHAPTER')}
              className="p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors group"
            >
              <Book className="w-5 h-5 text-blue-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Leer capítulo</p>
              <p className="text-xs text-blue-600">+5 XP</p>
            </button>
            
            <button 
              onClick={() => addXP('WRITE_REVIEW')}
              className="p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors group"
            >
              <MessageCircle className="w-5 h-5 text-green-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Escribir review</p>
              <p className="text-xs text-green-600">+25 XP</p>
            </button>
          </div>
        </div>

        {/* Botón para ver todas las recompensas */}
        <button 
          onClick={() => setShowRewards(!showRewards)}
          className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
        >
          Ver Todas las Recompensas
        </button>
      </div>

      {/* Modal de recompensas */}
      {showRewards && <RewardsModal onClose={() => setShowRewards(false)} />}
    </div>
  );
};

// Modal con todas las recompensas disponibles
const RewardsModal = ({ onClose }) => {
  const rewards = [
    { action: 'Leer capítulo', xp: 5, icon: Book, color: 'text-blue-600' },
    { action: 'Escribir review', xp: 25, icon: MessageCircle, color: 'text-green-600' },
    { action: 'Comentar', xp: 10, icon: MessageCircle, color: 'text-purple-600' },
    { action: 'Like a contenido', xp: 2, icon: Heart, color: 'text-red-600' },
    { action: 'Agregar a lista', xp: 5, icon: Star, color: 'text-yellow-600' },
    { action: 'Completar serie', xp: 50, icon: Trophy, color: 'text-orange-600' },
    { action: 'Login diario', xp: 10, icon: Calendar, color: 'text-indigo-600' },
    { action: 'Compartir contenido', xp: 15, icon: TrendingUp, color: 'text-teal-600' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Sistema de Recompensas
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {rewards.map((reward, index) => {
              const Icon = reward.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Icon className={`w-5 h-5 ${reward.color}`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{reward.action}</p>
                  </div>
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-sm font-medium">
                    +{reward.xp} XP
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💡 Consejos para Ganar XP</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Mantén tu racha diaria de login</li>
              <li>• Escribe reviews detalladas para más XP</li>
              <li>• Participa en discusiones de la comunidad</li>
              <li>• Completa series para grandes bonificaciones</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar XP ganado
export const XPNotification = ({ xp, action, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in-right">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-300" />
        <span className="font-medium">+{xp} XP</span>
        <span className="text-green-200">• {action}</span>
      </div>
    </div>
  );
};

export default GamificationPanel;