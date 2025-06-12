// src/components/notifications/CompleteNotificationSystem.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  Trash2, 
  Settings, 
  Heart, 
  MessageCircle, 
  UserPlus,
  Star,
  Play,
  BookOpen,
  Award,
  Zap,
  Calendar,
  TrendingUp,
  Gift,
  Crown,
  Shield,
  Eye,
  EyeOff,
  Filter,
  Search,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Clock,
  User,
  AtSign,
  Share2,
  Flag,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Plus,
  Minus,
  RefreshCw
} from 'lucide-react';

const CompleteNotificationSystem = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, mentions, follows, likes, comments
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Mock data para notificaciones
  const mockNotifications = [
    {
      id: 1,
      type: 'like',
      title: 'Te dieron me gusta',
      message: 'A AnimeExpert2024 y 12 personas más les gustó tu reseña de "Attack on Titan"',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
      avatar: '/api/placeholder/40/40',
      actionUrl: '/reviews/attack-on-titan-review',
      priority: 'normal',
      category: 'social',
      metadata: {
        count: 13,
        contentType: 'review',
        contentTitle: 'Attack on Titan'
      }
    },
    {
      id: 2,
      type: 'comment',
      title: 'Nuevo comentario',
      message: 'MangaReader99 comentó en tu reseña: "Totalmente de acuerdo, especialmente con lo que dices sobre..."',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      read: false,
      avatar: '/api/placeholder/40/40',
      actionUrl: '/reviews/my-review#comment-123',
      priority: 'high',
      category: 'social',
      metadata: {
        username: 'MangaReader99',
        contentType: 'review'
      }
    },
    {
      id: 3,
      type: 'follow',
      title: 'Nuevo seguidor',
      message: 'TheoryMaster ha comenzado a seguirte',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      avatar: '/api/placeholder/40/40',
      actionUrl: '/profile/theorymaster',
      priority: 'normal',
      category: 'social',
      metadata: {
        username: 'TheoryMaster'
      }
    },
    {
      id: 4,
      type: 'episode',
      title: 'Nuevo episodio disponible',
      message: 'Frieren: Beyond Journey\'s End - Episodio 16 ya está disponible',
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      read: true,
      avatar: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg',
      actionUrl: '/anime/frieren/episode/16',
      priority: 'high',
      category: 'content',
      metadata: {
        animeTitle: 'Frieren: Beyond Journey\'s End',
        episode: 16,
        platform: 'Crunchyroll'
      }
    },
    {
      id: 5,
      type: 'achievement',
      title: '¡Logro desbloqueado!',
      message: 'Has desbloqueado "Crítico Prolífico" por escribir 50 reseñas',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
      avatar: null,
      actionUrl: '/profile/achievements',
      priority: 'normal',
      category: 'gamification',
      metadata: {
        achievementName: 'Crítico Prolífico',
        xpGained: 1000,
        pointsGained: 500
      }
    },
    {
      id: 6,
      type: 'mention',
      title: 'Te mencionaron',
      message: 'CasualViewer te mencionó en una discusión sobre "One Piece"',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      read: false,
      avatar: '/api/placeholder/40/40',
      actionUrl: '/discussions/one-piece-latest-chapter#mention-456',
      priority: 'high',
      category: 'social',
      metadata: {
        username: 'CasualViewer',
        discussionTitle: 'One Piece - Capítulo Más Reciente'
      }
    },
    {
      id: 7,
      type: 'system',
      title: 'Actualización del sistema',
      message: 'Nuevas funciones disponibles: Lector de manga mejorado y sistema de listas colaborativas',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: true,
      avatar: null,
      actionUrl: '/updates/latest',
      priority: 'low',
      category: 'system',
      metadata: {
        version: '2.1.0',
        features: ['Manga Reader', 'Collaborative Lists']
      }
    }
  ];

  const [notificationSettings, setNotificationSettings] = useState({
    sound: true,
    desktop: true,
    email: true,
    categories: {
      social: true,
      content: true,
      gamification: true,
      system: false
    },
    filters: {
      likes: true,
      comments: true,
      follows: true,
      mentions: true,
      episodes: true,
      achievements: true
    }
  });

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, filter]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Simular carga de notificaciones
      await new Promise(resolve => setTimeout(resolve, 500));
      let filtered = [...mockNotifications];
      
      if (filter !== 'all') {
        filtered = filtered.filter(notif => {
          switch (filter) {
            case 'unread': return !notif.read;
            case 'mentions': return notif.type === 'mention';
            case 'follows': return notif.type === 'follow';
            case 'likes': return notif.type === 'like';
            case 'comments': return notif.type === 'comment';
            default: return true;
          }
        });
      }

      if (searchQuery) {
        filtered = filtered.filter(notif => 
          notif.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notif.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setNotifications(filtered);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const deleteAllRead = () => {
    setNotifications(prev => 
      prev.filter(notif => !notif.read)
    );
  };

  const getNotificationIcon = (type) => {
    const icons = {
      like: Heart,
      comment: MessageCircle,
      follow: UserPlus,
      mention: AtSign,
      episode: Play,
      chapter: BookOpen,
      achievement: Award,
      system: Settings,
      gift: Gift,
      moderator: Shield
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'text-red-400 bg-red-400/10';
    
    const colors = {
      like: 'text-red-400 bg-red-400/10',
      comment: 'text-blue-400 bg-blue-400/10',
      follow: 'text-green-400 bg-green-400/10',
      mention: 'text-purple-400 bg-purple-400/10',
      episode: 'text-orange-400 bg-orange-400/10',
      chapter: 'text-teal-400 bg-teal-400/10',
      achievement: 'text-yellow-400 bg-yellow-400/10',
      system: 'text-gray-400 bg-gray-400/10'
    };
    return colors[type] || 'text-gray-400 bg-gray-400/10';
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return timestamp.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filters = [
    { value: 'all', label: 'Todas', icon: Bell },
    { value: 'unread', label: 'No leídas', icon: Eye },
    { value: 'mentions', label: 'Menciones', icon: AtSign },
    { value: 'follows', label: 'Seguidores', icon: UserPlus },
    { value: 'likes', label: 'Me gustas', icon: Heart },
    { value: 'comments', label: 'Comentarios', icon: MessageCircle }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      {/* Notification Panel */}
      <div 
        ref={dropdownRef}
        className="fixed top-16 right-4 w-96 max-h-[80vh] bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-white">Notificaciones</h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                <Settings size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar notificaciones..."
              className="w-full pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-700 p-1 rounded-lg overflow-x-auto">
            {filters.map(filterOption => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm whitespace-nowrap ${
                  filter === filterOption.value 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-600'
                }`}
              >
                <filterOption.icon size={14} />
                <span>{filterOption.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
              >
                <CheckCheck size={14} />
                <span>Marcar todas</span>
              </button>
              <button
                onClick={deleteAllRead}
                className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
              >
                <Trash2 size={14} />
                <span>Eliminar leídas</span>
              </button>
            </div>
            <button
              onClick={loadNotifications}
              className="p-1 text-gray-400 hover:text-white rounded transition-colors"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 bg-gray-750 border-b border-gray-700">
            <h3 className="text-white font-medium mb-3">Configuración de Notificaciones</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Sonido</span>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    soundEnabled ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </label>

              <label className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Notificaciones de escritorio</span>
                <button
                  onClick={() => setNotificationSettings(prev => ({
                    ...prev,
                    desktop: !prev.desktop
                  }))}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    notificationSettings.desktop ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    notificationSettings.desktop ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </label>

              <div className="pt-2">
                <span className="text-gray-300 text-sm block mb-2">Categorías</span>
                <div className="space-y-2">
                  {Object.entries(notificationSettings.categories).map(([category, enabled]) => (
                    <label key={category} className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs capitalize">{category}</span>
                      <button
                        onClick={() => setNotificationSettings(prev => ({
                          ...prev,
                          categories: {
                            ...prev.categories,
                            [category]: !enabled
                          }
                        }))}
                        className={`w-8 h-4 rounded-full transition-colors relative ${
                          enabled ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                          enabled ? 'translate-x-4' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">No hay notificaciones</h3>
              <p className="text-gray-400 text-sm">Te notificaremos cuando haya algo nuevo</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {notifications.map(notification => {
                const IconComponent = getNotificationIcon(notification.type);
                const colorClasses = getNotificationColor(notification.type, notification.priority);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors cursor-pointer ${
                      !notification.read 
                        ? 'bg-blue-600/5 hover:bg-blue-600/10' 
                        : 'hover:bg-gray-700/50'
                    }`}
                    onClick={() => {
                      markAsRead(notification.id);
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                      }
                    }}
                  >
                    <div className="flex space-x-3">
                      {/* Avatar or Icon */}
                      <div className="flex-shrink-0">
                        {notification.avatar ? (
                          <img 
                            src={notification.avatar}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses}`}>
                            <IconComponent size={20} />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${
                              !notification.read ? 'text-white' : 'text-gray-300'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className={`text-sm mt-1 ${
                              !notification.read ? 'text-gray-300' : 'text-gray-400'
                            }`}>
                              {notification.message}
                            </p>
                            
                            {/* Metadata */}
                            {notification.metadata && (
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                {notification.metadata.count && (
                                  <span>{notification.metadata.count} personas</span>
                                )}
                                {notification.metadata.xpGained && (
                                  <span className="flex items-center space-x-1">
                                    <Zap size={12} className="text-blue-400" />
                                    <span>+{notification.metadata.xpGained} XP</span>
                                  </span>
                                )}
                                {notification.metadata.platform && (
                                  <span>{notification.metadata.platform}</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-start space-x-1 ml-2">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <div className="flex space-x-1">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-400 rounded transition-colors"
                                  title="Marcar como leída"
                                >
                                  <Check size={12} />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-1 text-gray-400 hover:text-red-400 rounded transition-colors"
                                title="Eliminar notificación"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Unread Indicator */}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full absolute left-2 top-6"></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => window.location.href = '/notifications'}
            className="w-full text-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            Ver todas las notificaciones
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteNotificationSystem;