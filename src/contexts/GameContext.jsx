import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto
const GameContext = createContext();

// Hook personalizado para usar el contexto
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame debe ser usado dentro de un GameProvider');
  }
  return context;
};

// Tipos de acciones que otorgan XP
const XP_ACTIONS = {
  READ_CHAPTER: { xp: 10, name: 'Leer capítulo' },
  WATCH_EPISODE: { xp: 15, name: 'Ver episodio' },
  WRITE_REVIEW: { xp: 50, name: 'Escribir review' },
  COMMENT: { xp: 5, name: 'Comentar' },
  LIKE_CONTENT: { xp: 2, name: 'Dar like' },
  SHARE_CONTENT: { xp: 8, name: 'Compartir contenido' },
  ADD_TO_FAVORITES: { xp: 3, name: 'Agregar a favoritos' },
  COMPLETE_ANIME: { xp: 100, name: 'Completar anime' },
  COMPLETE_MANGA: { xp: 150, name: 'Completar manga' },
  WRITE_NOVEL: { xp: 200, name: 'Escribir novela ligera' },
  DAILY_LOGIN: { xp: 20, name: 'Conexión diaria' },
  WEEKLY_STREAK: { xp: 100, name: 'Racha semanal' },
  MONTHLY_GOAL: { xp: 500, name: 'Meta mensual' },
};

// Niveles y XP requerido
const LEVELS = [
  { level: 1, xpRequired: 0, title: 'Novato Otaku', icon: '🌱' },
  { level: 2, xpRequired: 100, title: 'Fan Casual', icon: '⭐' },
  { level: 3, xpRequired: 300, title: 'Entusiasta', icon: '🔥' },
  { level: 4, xpRequired: 600, title: 'Conocedor', icon: '💎' },
  { level: 5, xpRequired: 1000, title: 'Experto', icon: '👑' },
  { level: 6, xpRequired: 1500, title: 'Maestro', icon: '🏆' },
  { level: 7, xpRequired: 2200, title: 'Leyenda', icon: '⚡' },
  { level: 8, xpRequired: 3000, title: 'Mítico', icon: '🌟' },
  { level: 9, xpRequired: 4000, title: 'Legendario', icon: '🚀' },
  { level: 10, xpRequired: 5500, title: 'Otaku Supremo', icon: '🌈' },
];

// Logros disponibles
const ACHIEVEMENTS = {
  FIRST_ANIME: {
    id: 'first_anime',
    name: 'Primer Anime',
    description: 'Ver tu primer episodio de anime',
    icon: '🎬',
    xp: 25,
    category: 'milestone',
  },
  FIRST_MANGA: {
    id: 'first_manga',
    name: 'Primer Manga',
    description: 'Leer tu primer capítulo de manga',
    icon: '📖',
    xp: 25,
    category: 'milestone',
  },
  NIGHT_OWL: {
    id: 'night_owl',
    name: 'Búho Nocturno',
    description: 'Leer después de medianoche',
    icon: '🦉',
    xp: 15,
    category: 'time',
  },
  BINGE_WATCHER: {
    id: 'binge_watcher',
    name: 'Maratonista',
    description: 'Ver 5 episodios seguidos',
    icon: '📺',
    xp: 50,
    category: 'consumption',
  },
  SPEED_READER: {
    id: 'speed_reader',
    name: 'Lector Veloz',
    description: 'Leer 10 capítulos en un día',
    icon: '⚡',
    xp: 75,
    category: 'consumption',
  },
  SOCIAL_BUTTERFLY: {
    id: 'social_butterfly',
    name: 'Mariposa Social',
    description: 'Hacer 20 comentarios',
    icon: '🦋',
    xp: 40,
    category: 'social',
  },
  CRITIC: {
    id: 'critic',
    name: 'Crítico',
    description: 'Escribir 5 reviews',
    icon: '✍️',
    xp: 100,
    category: 'content',
  },
  COMPLETIONIST: {
    id: 'completionist',
    name: 'Completista',
    description: 'Completar 10 series',
    icon: '✅',
    xp: 200,
    category: 'milestone',
  },
  STREAK_MASTER: {
    id: 'streak_master',
    name: 'Maestro de Rachas',
    description: 'Mantener racha de 30 días',
    icon: '🔥',
    xp: 300,
    category: 'consistency',
  },
  NOVELIST: {
    id: 'novelist',
    name: 'Novelista',
    description: 'Escribir tu primera novela ligera',
    icon: '📝',
    xp: 250,
    category: 'content',
  },
};

// Provider del contexto
export const GameProvider = ({ children }) => {
  const [gameData, setGameData] = useState({
    xp: 0,
    level: 1,
    points: 0,
    streak: 0,
    lastLoginDate: null,
    achievements: [],
    stats: {
      episodesWatched: 0,
      chaptersRead: 0,
      animesCompleted: 0,
      mangasCompleted: 0,
      reviewsWritten: 0,
      commentsPosted: 0,
      likesGiven: 0,
      novelsWritten: 0,
    },
    dailyGoals: {
      episodesToday: 0,
      chaptersToday: 0,
      commentsToday: 0,
      targetEpisodes: 3,
      targetChapters: 5,
      targetComments: 2,
    },
  });

  // Cargar datos guardados al inicializar
  useEffect(() => {
    const savedData = localStorage.getItem('gameData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setGameData(prev => ({ ...prev, ...parsed }));
    }

    // Verificar conexión diaria
    checkDailyLogin();
  }, []);

  // Guardar datos cuando cambien
  useEffect(() => {
    localStorage.setItem('gameData', JSON.stringify(gameData));
  }, [gameData]);

  // Función para verificar conexión diaria
  const checkDailyLogin = () => {
    const today = new Date().toDateString();
    const lastLogin = gameData.lastLoginDate;

    if (lastLogin !== today) {
      if (lastLogin === new Date(Date.now() - 86400000).toDateString()) {
        // Ayer se conectó, mantener racha
        addXP(XP_ACTIONS.DAILY_LOGIN.xp, XP_ACTIONS.DAILY_LOGIN.name);
        setGameData(prev => ({
          ...prev,
          streak: prev.streak + 1,
          lastLoginDate: today,
          dailyGoals: {
            ...prev.dailyGoals,
            episodesToday: 0,
            chaptersToday: 0,
            commentsToday: 0,
          },
        }));
      } else {
        // Se perdió la racha
        addXP(XP_ACTIONS.DAILY_LOGIN.xp, XP_ACTIONS.DAILY_LOGIN.name);
        setGameData(prev => ({
          ...prev,
          streak: 1,
          lastLoginDate: today,
          dailyGoals: {
            ...prev.dailyGoals,
            episodesToday: 0,
            chaptersToday: 0,
            commentsToday: 0,
          },
        }));
      }
    }
  };

  // Función para calcular nivel basado en XP
  const calculateLevel = (xp) => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].xpRequired) {
        return LEVELS[i];
      }
    }
    return LEVELS[0];
  };

  // Función para agregar XP
  const addXP = (amount, reason = 'Acción completada') => {
    setGameData(prev => {
      const newXP = prev.xp + amount;
      const newLevel = calculateLevel(newXP);
      const levelUp = newLevel.level > prev.level;

      return {
        ...prev,
        xp: newXP,
        level: newLevel.level,
        points: prev.points + Math.floor(amount / 2), // Puntos canjeables
      };
    });

    // Mostrar notificación de XP ganado
    if (window.gameNotification) {
      window.gameNotification(`+${amount} XP: ${reason}`);
    }

    return amount;
  };

  // Función para desbloquear logro
  const unlockAchievement = (achievementId) => {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement || gameData.achievements.includes(achievementId)) {
      return false;
    }

    setGameData(prev => ({
      ...prev,
      achievements: [...prev.achievements, achievementId],
    }));

    addXP(achievement.xp, `Logro: ${achievement.name}`);

    // Mostrar notificación de logro
    if (window.gameNotification) {
      window.gameNotification(`🏆 Logro desbloqueado: ${achievement.name}!`);
    }

    return true;
  };

  // Acciones específicas de gamificación
  const watchEpisode = (animeId) => {
    setGameData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        episodesWatched: prev.stats.episodesWatched + 1,
      },
      dailyGoals: {
        ...prev.dailyGoals,
        episodesToday: prev.dailyGoals.episodesToday + 1,
      },
    }));

    addXP(XP_ACTIONS.WATCH_EPISODE.xp, XP_ACTIONS.WATCH_EPISODE.name);

    // Verificar logros
    if (gameData.stats.episodesWatched === 0) {
      unlockAchievement('FIRST_ANIME');
    }

    // Verificar si es después de medianoche
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) {
      unlockAchievement('NIGHT_OWL');
    }
  };

  const readChapter = (mangaId) => {
    setGameData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        chaptersRead: prev.stats.chaptersRead + 1,
      },
      dailyGoals: {
        ...prev.dailyGoals,
        chaptersToday: prev.dailyGoals.chaptersToday + 1,
      },
    }));

    addXP(XP_ACTIONS.READ_CHAPTER.xp, XP_ACTIONS.READ_CHAPTER.name);

    // Verificar logros
    if (gameData.stats.chaptersRead === 0) {
      unlockAchievement('FIRST_MANGA');
    }

    if (gameData.dailyGoals.chaptersToday >= 10) {
      unlockAchievement('SPEED_READER');
    }
  };

  const writeReview = () => {
    setGameData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        reviewsWritten: prev.stats.reviewsWritten + 1,
      },
    }));

    addXP(XP_ACTIONS.WRITE_REVIEW.xp, XP_ACTIONS.WRITE_REVIEW.name);

    if (gameData.stats.reviewsWritten >= 5) {
      unlockAchievement('CRITIC');
    }
  };

  const postComment = () => {
    setGameData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        commentsPosted: prev.stats.commentsPosted + 1,
      },
      dailyGoals: {
        ...prev.dailyGoals,
        commentsToday: prev.dailyGoals.commentsToday + 1,
      },
    }));

    addXP(XP_ACTIONS.COMMENT.xp, XP_ACTIONS.COMMENT.name);

    if (gameData.stats.commentsPosted >= 20) {
      unlockAchievement('SOCIAL_BUTTERFLY');
    }
  };

  const completeAnime = () => {
    setGameData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        animesCompleted: prev.stats.animesCompleted + 1,
      },
    }));

    addXP(XP_ACTIONS.COMPLETE_ANIME.xp, XP_ACTIONS.COMPLETE_ANIME.name);

    const totalCompleted = gameData.stats.animesCompleted + gameData.stats.mangasCompleted + 1;
    if (totalCompleted >= 10) {
      unlockAchievement('COMPLETIONIST');
    }
  };

  const completeManga = () => {
    setGameData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        mangasCompleted: prev.stats.mangasCompleted + 1,
      },
    }));

    addXP(XP_ACTIONS.COMPLETE_MANGA.xp, XP_ACTIONS.COMPLETE_MANGA.name);

    const totalCompleted = gameData.stats.animesCompleted + gameData.stats.mangasCompleted + 1;
    if (totalCompleted >= 10) {
      unlockAchievement('COMPLETIONIST');
    }
  };

  // Función para canjear puntos
  const redeemPoints = (cost, reward) => {
    if (gameData.points < cost) {
      return { success: false, message: 'Puntos insuficientes' };
    }

    setGameData(prev => ({
      ...prev,
      points: prev.points - cost,
    }));

    return { success: true, message: `Has canjeado: ${reward}` };
  };

  // Función para obtener progreso al siguiente nivel
  const getProgressToNextLevel = () => {
    const currentLevel = calculateLevel(gameData.xp);
    const nextLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
    
    if (nextLevelIndex >= LEVELS.length) {
      return { progress: 100, xpNeeded: 0, nextLevel: null };
    }

    const nextLevel = LEVELS[nextLevelIndex];
    const xpInCurrentLevel = gameData.xp - currentLevel.xpRequired;
    const xpNeededForNext = nextLevel.xpRequired - currentLevel.xpRequired;
    const progress = (xpInCurrentLevel / xpNeededForNext) * 100;

    return {
      progress: Math.min(progress, 100),
      xpNeeded: nextLevel.xpRequired - gameData.xp,
      nextLevel,
    };
  };

  // Función para obtener logros disponibles (no desbloqueados)
  const getAvailableAchievements = () => {
    return Object.values(ACHIEVEMENTS).filter(
      achievement => !gameData.achievements.includes(achievement.id)
    );
  };

  // Función para obtener logros desbloqueados
  const getUnlockedAchievements = () => {
    return gameData.achievements.map(id => ACHIEVEMENTS[Object.keys(ACHIEVEMENTS).find(key => ACHIEVEMENTS[key].id === id)]);
  };

  // Valor del contexto
  const value = {
    // Estado
    gameData,
    currentLevel: calculateLevel(gameData.xp),
    
    // Acciones de gamificación
    watchEpisode,
    readChapter,
    writeReview,
    postComment,
    completeAnime,
    completeManga,
    addXP,
    unlockAchievement,
    redeemPoints,
    
    // Utilidades
    getProgressToNextLevel,
    getAvailableAchievements,
    getUnlockedAchievements,
    
    // Constantes
    LEVELS,
    ACHIEVEMENTS,
    XP_ACTIONS,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};