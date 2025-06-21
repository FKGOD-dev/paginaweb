import React, { useState, useEffect, useContext, createContext } from 'react';
import { Search, Menu, Bell, User, Star, Heart, Eye, MessageCircle, TrendingUp, Filter, Grid, List, Play, BookOpen, Users, Trophy, Settings, Home, Plus, X, ChevronDown, ChevronRight, ChevronLeft, Upload, Edit3, Trash2, Share2, Bookmark, Flag, ThumbsUp, ThumbsDown, Clock, Calendar, Globe, Lock, Moon, Sun, Zap, Award, Shield, Crown, Flame, Target, Gift, Volume2, VolumeX, Maximize, Minimize, RotateCcw, ChevronUp, MapPin, Camera, Mail, Phone, Link, Facebook, Twitter, Instagram, Youtube, Twitch, CheckCircle, AlertCircle, Info, Gamepad2, Headphones, Monitor, Smartphone, Tablet, Send, Image, FileText, Download, RefreshCw, ExternalLink } from 'lucide-react';

// Context para el estado global
const AppContext = createContext();

// Configuración de la API
const API_BASE_URL = 'http://localhost:3001/api';

// Clase para manejar las llamadas a la API Real
class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Error en la petición');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Autenticación
  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.token = data.token;
    localStorage.setItem('authToken', data.token);
    return data;
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Búsqueda Global
  async globalSearch(query, options = {}) {
    const params = new URLSearchParams({
      query,
      ...options,
    });
    return this.request(`/search/global?${params}`);
  }

  async getSearchSuggestions(query, type = 'all') {
    const params = new URLSearchParams({ query, type });
    return this.request(`/search/suggestions?${params}`);
  }

  async getTrendingContent(period = 'week', limit = 20) {
    const params = new URLSearchParams({ period, limit });
    return this.request(`/search/trending?${params}`);
  }

  async getSearchFilters() {
    return this.request('/search/filters');
  }

  async advancedSearch(filters) {
    return this.request('/search/advanced', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  // Contenido - Anime/Manga
  async getAnime(id) {
    return this.request(`/anime/${id}`);
  }

  async getManga(id) {
    return this.request(`/manga/${id}`);
  }

  async getAnimeList(params = {}) {
    const query = new URLSearchParams(params);
    return this.request(`/anime?${query}`);
  }

  async getMangaList(params = {}) {
    const query = new URLSearchParams(params);
    return this.request(`/manga?${query}`);
  }

  // Comentarios
  async getComments(params) {
    const query = new URLSearchParams(params);
    return this.request(`/comments?${query}`);
  }

  async createComment(data) {
    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateComment(id, data) {
    return this.request(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteComment(id) {
    return this.request(`/comments/${id}`, {
      method: 'DELETE',
    });
  }

  async voteComment(commentId, isUpvote) {
    return this.request(`/comments/${commentId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ isUpvote }),
    });
  }

  async reportComment(commentId, reason) {
    return this.request(`/comments/${commentId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Listas
  async getLists(params = {}) {
    const query = new URLSearchParams(params);
    return this.request(`/lists?${query}`);
  }

  async getList(id) {
    return this.request(`/lists/${id}`);
  }

  async createList(data) {
    return this.request('/lists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateList(id, data) {
    return this.request(`/lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteList(id) {
    return this.request(`/lists/${id}`, {
      method: 'DELETE',
    });
  }

  async voteList(listId, isUpvote) {
    return this.request(`/lists/${listId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ isUpvote }),
    });
  }

  async addItemToList(listId, item) {
    return this.request(`/lists/${listId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async removeItemFromList(listId, itemId) {
    return this.request(`/lists/${listId}/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async getMyLists(params = {}) {
    const query = new URLSearchParams(params);
    return this.request(`/lists/my-lists?${query}`);
  }

  async getPopularLists(timeframe = 'week', limit = 20) {
    const params = new URLSearchParams({ timeframe, limit });
    return this.request(`/lists/trending/popular?${params}`);
  }

  // Notificaciones
  async getNotifications(params = {}) {
    const query = new URLSearchParams(params);
    return this.request(`/notifications?${query}`);
  }

  async markNotificationsAsRead(notificationIds) {
    return this.request('/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ notificationIds }),
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'POST',
    });
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }

  async deleteNotification(id) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  async getNotificationPreferences() {
    return this.request('/notifications/preferences');
  }

  async updateNotificationPreferences(preferences) {
    return this.request('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  async getNotificationStats() {
    return this.request('/notifications/stats');
  }

  // Upload de archivos
  async uploadFile(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.type) {
      formData.append('options', JSON.stringify({ type: options.type }));
    }

    return this.request('/upload/single', {
      method: 'POST',
      body: formData,
      headers: {}, // No Content-Type para multipart
    });
  }

  async uploadMultipleFiles(files) {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    return this.request('/upload/multiple', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async getMyUploads(params = {}) {
    const query = new URLSearchParams(params);
    return this.request(`/upload/my-uploads?${query}`);
  }

  async deleteUpload(id) {
    return this.request(`/upload/${id}`, {
      method: 'DELETE',
    });
  }

  async getUploadStats() {
    return this.request('/upload/stats');
  }

  // Usuarios y Perfil
  async updateProfile(data) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserStats() {
    return this.request('/users/stats');
  }

  async getAchievements() {
    return this.request('/users/achievements');
  }

  // Sistema de favoritos
  async addToFavorites(type, id) {
    return this.request('/users/favorites', {
      method: 'POST',
      body: JSON.stringify({ type, id }),
    });
  }

  async removeFromFavorites(type, id) {
    return this.request(`/users/favorites/${type}/${id}`, {
      method: 'DELETE',
    });
  }

  async getFavorites(type = 'all') {
    return this.request(`/users/favorites?type=${type}`);
  }

  // Novelas ligeras (si está implementado en el backend)
  async getLightNovels(params = {}) {
    const query = new URLSearchParams(params);
    return this.request(`/light-novels?${query}`);
  }

  async createLightNovel(data) {
    return this.request('/light-novels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLightNovel(id) {
    return this.request(`/light-novels/${id}`);
  }

  async updateLightNovel(id, data) {
    return this.request(`/light-novels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

const api = new ApiService(API_BASE_URL);

// Provider del contexto
const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar autenticación al cargar
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const userData = await api.getProfile();
          setUser(userData.user);
          setIsAuthenticated(true);
          
          // Cargar notificaciones
          fetchNotifications();
        } catch (error) {
          console.error('Error loading user data:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Cargar tema del localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  // Aplicar tema
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fetchNotifications = async () => {
    try {
      const [notifData, countData] = await Promise.all([
        api.getNotifications({ page: 1, limit: 10 }),
        api.getUnreadCount()
      ]);
      setNotifications(notifData.notifications || []);
      setUnreadCount(countData.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const login = async (credentials) => {
    try {
      const data = await api.login(credentials);
      setUser(data.user);
      setIsAuthenticated(true);
      fetchNotifications();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setIsAuthenticated(false);
    setNotifications([]);
    setUnreadCount(0);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const updateUnreadCount = (count) => {
    setUnreadCount(count);
  };

  const value = {
    user,
    isAuthenticated,
    notifications,
    unreadCount,
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    darkMode,
    toggleDarkMode,
    login,
    logout,
    fetchNotifications,
    updateUnreadCount,
    loading,
    api
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={value}>
      <div className={darkMode ? 'dark' : ''}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Hook para manejar notificaciones en tiempo real
const useRealTimeNotifications = () => {
  const { updateUnreadCount, fetchNotifications } = useApp();

  useEffect(() => {
    // WebSocket para notificaciones en tiempo real
    const ws = new WebSocket('ws://localhost:3001');
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          fetchNotifications();
        } else if (data.type === 'unread_count') {
          updateUnreadCount(data.count);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [updateUnreadCount, fetchNotifications]);
};

// Componente Header
const Header = () => {
  const { 
    user, 
    isAuthenticated, 
    unreadCount, 
    currentPage, 
    setCurrentPage, 
    searchQuery, 
    setSearchQuery, 
    darkMode, 
    toggleDarkMode, 
    logout,
    api 
  } = useApp();
  
  const [showSearch, setShowSearch] = useState(false);
  const [searchSuggestions, setSuggestions] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Hook para notificaciones en tiempo real
  useRealTimeNotifications();

  const handleSearch = async (query) => {
    if (query.length > 2) {
      try {
        setIsSearching(true);
        const response = await api.getSearchSuggestions(query);
        setSuggestions(response.suggestions || []);
      } catch (error) {
        console.error('Error getting suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const performSearch = (query) => {
    if (query.trim()) {
      setSearchQuery(query.trim());
      setCurrentPage('search');
      setShowSearch(false);
      setSuggestions([]);
    }
  };
 const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleSubmit();
  }
};
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div 
              className="text-2xl font-bold text-purple-600 dark:text-purple-400 cursor-pointer flex items-center space-x-2"
              onClick={() => setCurrentPage('home')}
            >
              <BookOpen className="w-8 h-8" />
              <span>MangaVerse</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {[
              { id: 'home', label: 'Inicio', icon: Home },
              { id: 'anime', label: 'Anime', icon: Play },
              { id: 'manga', label: 'Manga', icon: BookOpen },
              { id: 'trending', label: 'Trending', icon: TrendingUp },
              { id: 'lists', label: 'Listas', icon: List },
              ...(isAuthenticated ? [{ id: 'light-novels', label: 'Novelas', icon: FileText }] : [])
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentPage(id)}
                className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === id
                    ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              
              {showSearch && (
                <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar anime, manga, personajes..."
                      className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleSearch(e.target.value);
                      }}
                      onKeyPress={handleKeyPress}
                      autoFocus
                    />
                    <div className="absolute right-3 top-2.5">
                      {isSearching ? (
                        <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                      ) : (
                        <Search className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {searchSuggestions.length > 0 && (
                    <div className="mt-2 max-h-60 overflow-y-auto">
                      {searchSuggestions.map((suggestion, index) => (
                        <div
                          key={`${suggestion.type}-${suggestion.id || index}`}
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer rounded-md transition-colors"
                          onClick={() => performSearch(suggestion.title || suggestion.name)}
                        >
                          {suggestion.coverImage && (
                            <img
                              src={suggestion.coverImage}
                              alt={suggestion.title || suggestion.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                              {suggestion.title || suggestion.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {suggestion.type}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <NotificationsDropdown onClose={() => setShowNotifications(false)} />
                  )}
                </div>

                {/* Profile */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-6 h-6 rounded-full" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span className="hidden md:block text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user?.username}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showProfile && (
                    <ProfileDropdown onClose={() => setShowProfile(false)} />
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage('login')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => setCurrentPage('register')}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Componente NotificationsDropdown
const NotificationsDropdown = ({ onClose }) => {
  const { notifications, api, updateUnreadCount } = useApp();
  const [loading, setLoading] = useState(false);

  const markAsRead = async (notificationIds) => {
    try {
      setLoading(true);
      await api.markNotificationsAsRead(notificationIds);
      const countData = await api.getUnreadCount();
      updateUnreadCount(countData.unreadCount);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      await api.markAllNotificationsAsRead();
      updateUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notificaciones</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-lg">{notification.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {notification.title}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {notification.message}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {notification.timeAgo}
                  </div>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <div>No hay notificaciones</div>
          </div>
        )}
      </div>
      
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={markAllAsRead}
            disabled={loading}
            className="w-full text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Marcando...' : 'Marcar todas como leídas'}
          </button>
        </div>
      )}
    </div>
  );
};

// Componente ProfileDropdown
const ProfileDropdown = ({ onClose }) => {
  const { user, logout, setCurrentPage } = useApp();

  const menuItems = [
    { id: 'profile', label: 'Mi Perfil', icon: User },
    { id: 'my-lists', label: 'Mis Listas', icon: List },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'uploads', label: 'Mis Uploads', icon: Upload },
    { id: 'achievements', label: 'Logros', icon: Trophy },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const handleItemClick = (id) => {
    setCurrentPage(id);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2">
      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
        <div className="font-medium text-gray-900 dark:text-gray-100">{user?.username}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Nivel {user?.level || 1} • {user?.xp || 0} XP
        </div>
      </div>
      
      {menuItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => handleItemClick(id)}
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-300 transition-colors"
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </button>
      ))}
      
      <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

// Componente HomePage
const HomePage = () => {
  const [trending, setTrending] = useState([]);
  const [popularLists, setPopularLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { api } = useApp();

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [trendingData, listsData] = await Promise.all([
        api.getTrendingContent('week', 12),
        api.getPopularLists('week', 6)
      ]);
      
      setTrending(trendingData.trendingContent || []);
      setPopularLists(listsData.lists || []);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative px-8 py-16 text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Descubre tu próxima
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              aventura
            </span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl">
            Explora miles de animes y mangas, crea listas personalizadas, 
            conecta con otros fans y sumérgete en el mejor contenido otaku.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              Explorar Anime
            </button>
            <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-purple-600 transition-colors">
              Leer Manga
            </button>
          </div>
        </div>
      </div>

      {/* Trending Section */}
      {trending.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🔥 Trending Ahora</h2>
            <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium flex items-center space-x-1 transition-colors">
              <span>Ver todo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trending.map((item) => (
              <ContentCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Lists */}
      {popularLists.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">📋 Listas Populares</h2>
            <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium flex items-center space-x-1 transition-colors">
              <span>Ver todas</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularLists.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>
        </section>
      )}

      {/* Quick Stats */}
      <section className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 transition-colors">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
          La comunidad más grande de anime y manga
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">50K+</div>
            <div className="text-gray-600 dark:text-gray-400">Títulos</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">1M+</div>
            <div className="text-gray-600 dark:text-gray-400">Usuarios</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">5M+</div>
            <div className="text-gray-600 dark:text-gray-400">Reseñas</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">100K+</div>
            <div className="text-gray-600 dark:text-gray-400">Listas</div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Componente ContentCard
const ContentCard = ({ item }) => {
  const { setCurrentPage } = useApp();
  
  const handleClick = () => {
    if (item.type === 'anime') {
      setCurrentPage(`anime-${item.id}`);
    } else if (item.type === 'manga') {
      setCurrentPage(`manga-${item.id}`);
    }
  };

  return (
    <div 
      className="group cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 mb-2">
        {item.coverImage ? (
          <img
            src={item.coverImage}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            {item.type === 'anime' ? <Play className="w-8 h-8" /> : <BookOpen className="w-8 h-8" />}
          </div>
        )}
        
        {/* Overlay with rating */}
        {item.rating && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{item.rating.toFixed(1)}</span>
          </div>
        )}
        
        {/* Type badge */}
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded capitalize">
          {item.type}
        </div>
      </div>
      
      <div>
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-gray-900 dark:text-gray-100">
          {item.titleEnglish || item.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {item.year && `${item.year} • `}{item.mediaType || item.type}
        </p>
      </div>
    </div>
  );
};

// Componente ListCard
const ListCard = ({ list }) => {
  const { setCurrentPage } = useApp();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-lg transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <h3 
          className="font-semibold text-lg hover:text-purple-600 dark:hover:text-purple-400 transition-colors line-clamp-1 text-gray-900 dark:text-gray-100"
          onClick={() => setCurrentPage(`list-${list.id}`)}
        >
          {list.name}
        </h3>
        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
          <ThumbsUp className="w-4 h-4" />
          <span>{list.upvotes || 0}</span>
        </div>
      </div>
      
      {list.description && (
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{list.description}</p>
      )}
      
      <div className="flex items-center space-x-2 mb-3">
        {list.previewItems?.slice(0, 3).map((item, index) => (
          <div key={index} className="w-8 h-10 rounded overflow-hidden bg-gray-200 dark:bg-gray-600">
            {item.content?.coverImage ? (
              <img
                src={item.content.coverImage}
                alt={item.content.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                {item.type === 'anime' ? <Play className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
              </div>
            )}
          </div>
        ))}
        {list.itemsCount > 3 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            +{list.itemsCount - 3} más
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-1">
          <User className="w-4 h-4" />
          <span>{list.user?.username}</span>
        </div>
        <div className="flex items-center space-x-1">
          <List className="w-4 h-4" />
          <span>{list.itemsCount} items</span>
        </div>
      </div>
    </div>
  );
};

// Componente SearchResults
const SearchResults = () => {
  const { searchQuery, api } = useApp();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    sortBy: 'relevance',
    page: 1
  });

  useEffect(() => {
    if (searchQuery) {
      performSearch();
    }
  }, [searchQuery, filters]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const data = await api.globalSearch(searchQuery, {
        type: filters.type,
        sortBy: filters.sortBy,
        page: filters.page,
        limit: 20
      });
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (!searchQuery) {
    return (
      <div className="text-center py-12">
        <Search className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Busca tu contenido favorito</h2>
        <p className="text-gray-500 dark:text-gray-500">Encuentra anime, manga, personajes y más</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Resultados para "{searchQuery}"
        </h1>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value, page: 1 }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Todos</option>
            <option value="anime">Anime</option>
            <option value="manga">Manga</option>
            <option value="characters">Personajes</option>
          </select>
          
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value, page: 1 }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="relevance">Relevancia</option>
            <option value="popularity">Popularidad</option>
            <option value="rating">Calificación</option>
            <option value="created">Más nuevos</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((item, index) => (
            <ContentCard key={`${item.type}-${item.id}-${index}`} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😅</div>
          <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No se encontraron resultados</h2>
          <p className="text-gray-500 dark:text-gray-500">Intenta con otros términos de búsqueda</p>
        </div>
      )}
    </div>
  );
};

// Componente Login
const Login = () => {
  const { login, setCurrentPage } = useApp();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      await login(formData);
      setCurrentPage('home');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white dark:bg-gray-800 p-8 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">Iniciar Sesión</h2>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => setCurrentPage('register')}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm transition-colors"
          >
            ¿No tienes cuenta? Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Register
const Register = () => {
  const { setCurrentPage, api } = useApp();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      setCurrentPage('login');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white dark:bg-gray-800 p-8 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">Crear Cuenta</h2>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de usuario
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => setCurrentPage('login')}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm transition-colors"
          >
            ¿Ya tienes cuenta? Inicia sesión aquí
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente principal App
const App = () => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AppContent />
        </main>
      </div>
    </AppProvider>
  );
};

// Componente AppContent para renderizar páginas
const AppContent = () => {
  const { currentPage } = useApp();

  // Páginas dinámicas
  if (currentPage.startsWith('anime-')) {
    const animeId = currentPage.replace('anime-', '');
    return <AnimeDetail id={animeId} />;
  }
  
  if (currentPage.startsWith('manga-')) {
    const mangaId = currentPage.replace('manga-', '');
    return <MangaDetail id={mangaId} />;
  }
  
  if (currentPage.startsWith('list-')) {
    const listId = currentPage.replace('list-', '');
    return <ListDetail id={listId} />;
  }

  // Páginas estáticas
  switch (currentPage) {
    case 'home':
      return <HomePage />;
    case 'search':
      return <SearchResults />;
    case 'trending':
      return <TrendingPage />;
    case 'lists':
      return <ListsPage />;
    case 'profile':
      return <Profile />;
    case 'login':
      return <Login />;
    case 'register':
      return <Register />;
    case 'light-novels':
      return <LightNovelsPage />;
    case 'uploads':
      return <UploadsPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <HomePage />;
  }
};

// Placeholder components for missing pages
const AnimeDetail = ({ id }) => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold mb-4">Anime Detail - ID: {id}</h1>
    <p>Esta página se implementará con los datos del backend</p>
  </div>
);

const MangaDetail = ({ id }) => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold mb-4">Manga Detail - ID: {id}</h1>
    <p>Esta página se implementará con los datos del backend</p>
  </div>
);

const ListDetail = ({ id }) => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold mb-4">List Detail - ID: {id}</h1>
    <p>Esta página se implementará con los datos del backend</p>
  </div>
);

const TrendingPage = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold mb-4">Página de Trending</h1>
    <p>Esta página mostrará el contenido trending usando la API del backend</p>
  </div>
);

const ListsPage = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold mb-4">Página de Listas</h1>
    <p>Esta página mostrará todas las listas usando la API del backend</p>
  </div>
);

const Profile = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>
    <p>Esta página mostrará el perfil del usuario con datos reales del backend</p>
  </div>
);

const LightNovelsPage = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold mb-4">Novelas Ligeras</h1>
    <p>Sistema de novelas ligeras de usuarios usando el backend</p>
  </div>
);

const UploadsPage = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold mb-4">Mis Uploads</h1>
    <p>Gestión de archivos subidos usando Cloudinary</p>
  </div>
);

const SettingsPage = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold mb-4">Configuración</h1>
    <p>Configuración de usuario y preferencias</p>
  </div>
);

export default App;