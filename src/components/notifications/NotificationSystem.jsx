// components/notifications/NotificationSystem.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  BellRing,
  X, 
  Check, 
  CheckCheck,
  Settings,
  MessageCircle,
  Heart,
  Star,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Calendar,
  Eye,
  Share2,
  UserPlus,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Filter,
  MoreHorizontal,
  Trash2,
  Pin,
  Archive
} from 'lucide-react';

// Tipos de notificación
const NOTIFICATION_TYPES = {
  COMMENT_REPLY: 'comment_reply',
  COMMENT_LIKE: 'comment_like',
  NEW_FOLLOWER: 'new_follower',
  MANGA_UPDATE: 'manga_update',
  ANIME_EPISODE: 'anime_episode',
  ACHIEVEMENT: 'achievement',
  MENTION: 'mention',
  REVIEW_LIKE: 'review_like',
  LIST_FOLLOW: 'list_follow',
  RECOMMENDATION: 'recommendation',
  SYSTEM: 'system'
};

// Hook para manejar notificaciones
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState({
    push: true,
    email: true,
    sound: true,
    desktop: true,
    types: {
      [NOTIFICATION_TYPES.COMMENT_REPLY]: true,
      [NOTIFICATION_TYPES.COMMENT_LIKE]: true,
      [NOTIFICATION_TYPES.NEW_FOLLOWER]: true,
      [NOTIFICATION_TYPES.MANGA_UPDATE]: true,
      [NOTIFICATION_TYPES.ANIME_EPISODE]: true,
      [NOTIFICATION_TYPES.ACHIEVEMENT]: true,
      [NOTIFICATION_TYPES.MENTION]: true,
      [NOTIFICATION_TYPES.REVIEW_LIKE]: true,
      [NOTIFICATION_TYPES.LIST_FOLLOW]: false,
      [NOTIFICATION_TYPES.RECOMMENDATION]: true,
      [NOTIFICATION_TYPES.SYSTEM]: true
    }
  });

  // Generar notificaciones mock
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: NOTIFICATION_TYPES.COMMENT_REPLY,
        title: 'Nueva respuesta a tu comentario',
        message: 'OnePieceLover respondió a tu comentario en "One Piece - Capítulo 1095"',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
        actionUrl: '/anime/21/comments',
        priority: 'normal'
      },
      {
        id: 2,
        type: NOTIFICATION_TYPES.MANGA_UPDATE,
        title: 'Nuevo capítulo disponible',
        message: 'Jujutsu Kaisen - Capítulo 245 ya está disponible para leer',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        image: 'https://picsum.photos/100/100?random=1',
        actionUrl: '/manga/read/jujutsu-kaisen/245',
        priority: 'high'
      },
      {
        id: 3,
        type: NOTIFICATION_TYPES.ACHIEVEMENT,
        title: '¡Logro desbloqueado!',
        message: 'Has conseguido el logro "Crítico Experto" por escribir 10 reseñas',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        actionUrl: '/profile/achievements',
        priority: 'high',
        special: true
      },
      {
        id: 4,
        type: NOTIFICATION_TYPES.NEW_FOLLOWER,
        title: 'Nuevo seguidor',
        message: 'AnimeGuru ahora te sigue',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        read: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
        actionUrl: '/profile/followers',
        priority: 'normal'
      },
      {
        id: 5,
        type: NOTIFICATION_TYPES.COMMENT_LIKE,
        title: 'Tu comentario recibió me gusta',
        message: '5 personas les gustó tu comentario en "Attack on Titan - Final"',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        read: true,
        actionUrl: '/anime/16/comments',
        priority: 'low'
      },
      {
        id: 6,
        type: NOTIFICATION_TYPES.ANIME_EPISODE,
        title: 'Nuevo episodio al aire',
        message: 'Demon Slayer S4 E12 se estrena en 30 minutos',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        read: true,
        image: 'https://picsum.photos/100/100?random=2',
        actionUrl: '/anime/watch/demon-slayer-s4',
        priority: 'high'
      },
      {
        id: 7,
        type: NOTIFICATION_TYPES.SYSTEM,
        title: 'Mantenimiento programado',
        message: 'El sitio estará en mantenimiento mañana de 2:00 AM a 4:00 AM UTC',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: true,
        actionUrl: '/announcements',
        priority: 'normal'
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Mostrar notificación del navegador si está habilitada
    if (settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.avatar || notification.image || '/favicon.ico',
        tag: notification.type
      });
    }

    // Reproducir sonido si está habilitado
    if (settings.sound) {
      // Aquí iría la lógica para reproducir un sonido
      console.log('🔔 Notification sound');
    }
  };

  return {
    notifications,
    unreadCount,
    settings,
    setSettings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification
  };
};

const NotificationSystem = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const dropdownRef = useRef(null);
  
  const {
    notifications,
    unreadCount,
    settings,
    setSettings,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Solicitar permisos de notificación
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'read':
        return notifications.filter(n => n.read);
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      [NOTIFICATION_TYPES.COMMENT_REPLY]: MessageCircle,
      [NOTIFICATION_TYPES.COMMENT_LIKE]: Heart,
      [NOTIFICATION_TYPES.NEW_FOLLOWER]: UserPlus,
      [NOTIFICATION_TYPES.MANGA_UPDATE]: BookOpen,
      [NOTIFICATION_TYPES.ANIME_EPISODE]: Eye,
      [NOTIFICATION_TYPES.ACHIEVEMENT]: Award,
      [NOTIFICATION_TYPES.MENTION]: MessageCircle,
      [NOTIFICATION_TYPES.REVIEW_LIKE]: Star,
      [NOTIFICATION_TYPES.LIST_FOLLOW]: Users,
      [NOTIFICATION_TYPES.RECOMMENDATION]: TrendingUp,
      [NOTIFICATION_TYPES.SYSTEM]: Settings
    };
    
    const IconComponent = iconMap[type] || Bell;
    return <IconComponent className="w-4 h-4" />;
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      [NOTIFICATION_TYPES.COMMENT_REPLY]: 'text-blue-600',
      [NOTIFICATION_TYPES.COMMENT_LIKE]: 'text-red-500',
      [NOTIFICATION_TYPES.NEW_FOLLOWER]: 'text-green-600',
      [NOTIFICATION_TYPES.MANGA_UPDATE]: 'text-purple-600',
      [NOTIFICATION_TYPES.ANIME_EPISODE]: 'text-orange-600',
      [NOTIFICATION_TYPES.ACHIEVEMENT]: 'text-yellow-600',
      [NOTIFICATION_TYPES.MENTION]: 'text-blue-600',
      [NOTIFICATION_TYPES.REVIEW_LIKE]: 'text-pink-600',
      [NOTIFICATION_TYPES.LIST_FOLLOW]: 'text-indigo-600',
      [NOTIFICATION_TYPES.RECOMMENDATION]: 'text-teal-600',
      [NOTIFICATION_TYPES.SYSTEM]: 'text-gray-600'
    };
    
    return colorMap[type] || 'text-gray-600';
  };

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-6 h-6" />
        ) : (
          <Bell className="w-6 h-6" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-[32rem] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notificaciones
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                >
                  <option value="all">Todas ({notifications.length})</option>
                  <option value="unread">No leídas ({unreadCount})</option>
                  <option value="read">Leídas ({notifications.length - unreadCount})</option>
                </select>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {getFilteredNotifications().length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                  No hay notificaciones
                </h4>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Te notificaremos cuando haya actividad nueva
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {getFilteredNotifications().map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    getIcon={getNotificationIcon}
                    getColor={getNotificationColor}
                    formatTime={formatTimeAgo}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              Ver todas las notificaciones
            </button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <NotificationSettings
          settings={settings}
          onSettingsChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

// Componente individual de notificación
const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  getIcon, 
  getColor, 
  formatTime 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      // Aquí iría la navegación a la URL
      console.log('Navigate to:', notification.actionUrl);
    }
  };

  return (
    <div
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors relative ${
        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      } ${notification.special ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon/Avatar */}
        <div className={`flex-shrink-0 ${getColor(notification.type)}`}>
          {notification.avatar ? (
            <img
              src={notification.avatar}
              alt=""
              className="w-8 h-8 rounded-full"
            />
          ) : notification.image ? (
            <img
              src={notification.image}
              alt=""
              className="w-8 h-8 rounded object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              {getIcon(notification.type)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {formatTime(notification.timestamp)}
              </p>
            </div>

            {/* Menu */}
            <div className="relative ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 w-40 z-10">
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification.id);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Check className="w-4 h-4" />
                      Marcar como leída
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(notification.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Unread indicator */}
        {!notification.read && (
          <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
        )}
      </div>

      {/* Priority indicator */}
      {notification.priority === 'high' && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
      )}
    </div>
  );
};

// Panel de configuración de notificaciones
const NotificationSettings = ({ settings, onSettingsChange, onClose }) => {
  const handleToggle = (key, value = null) => {
    if (value !== null) {
      onSettingsChange(prev => ({
        ...prev,
        types: {
          ...prev.types,
          [key]: value
        }
      }));
    } else {
      onSettingsChange(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  const notificationTypeLabels = {
    [NOTIFICATION_TYPES.COMMENT_REPLY]: 'Respuestas a comentarios',
    [NOTIFICATION_TYPES.COMMENT_LIKE]: 'Me gusta en comentarios',
    [NOTIFICATION_TYPES.NEW_FOLLOWER]: 'Nuevos seguidores',
    [NOTIFICATION_TYPES.MANGA_UPDATE]: 'Actualizaciones de manga',
    [NOTIFICATION_TYPES.ANIME_EPISODE]: 'Nuevos episodios',
    [NOTIFICATION_TYPES.ACHIEVEMENT]: 'Logros desbloqueados',
    [NOTIFICATION_TYPES.MENTION]: 'Menciones',
    [NOTIFICATION_TYPES.REVIEW_LIKE]: 'Me gusta en reviews',
    [NOTIFICATION_TYPES.LIST_FOLLOW]: 'Seguimiento de listas',
    [NOTIFICATION_TYPES.RECOMMENDATION]: 'Recomendaciones',
    [NOTIFICATION_TYPES.SYSTEM]: 'Anuncios del sistema'
  };

  return (
    <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Configuración
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* General Settings */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Métodos de notificación
            </h4>
            <div className="space-y-2">
              <label className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Push notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.push}
                  onChange={() => handleToggle('push')}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.email}
                  onChange={() => handleToggle('email')}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.sound ? <Volume2 className="w-4 h-4 text-gray-500" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
                  <span className="text-sm text-gray-700 dark:text-gray-300">Sonido</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.sound}
                  onChange={() => handleToggle('sound')}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </label>
            </div>
          </div>

          {/* Notification Types */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Tipos de notificación
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(notificationTypeLabels).map(([type, label]) => (
                <label key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  <input
                    type="checkbox"
                    checked={settings.types[type]}
                    onChange={() => handleToggle(type, !settings.types[type])}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSystem;
export { useNotifications, NOTIFICATION_TYPES };