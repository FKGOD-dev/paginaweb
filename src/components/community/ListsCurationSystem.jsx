// src/components/community/ListsCurationSystem.jsx
import React, { useState, useEffect } from 'react';
import { 
  List, 
  Plus, 
  Star, 
  Heart, 
  Users, 
  Eye, 
  MessageCircle, 
  Share2, 
  Search, 
  Filter,
  TrendingUp,
  Clock,
  Award,
  BookOpen,
  Play,
  Crown,
  Zap,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Grid,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Flag,
  ExternalLink,
  Tag,
  Calendar,
  User,
  Lock,
  Globe,
  Image,
  Settings,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from 'lucide-react';

const ListsCurationSystem = () => {
  const [activeTab, setActiveTab] = useState('discover'); // discover, my-lists, create, trending
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popularity'); // popularity, recent, rating, name
  const [filterBy, setFilterBy] = useState('all'); // all, anime, manga, mixed
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);

  // Mock data para listas de la comunidad
  const mockCommunityLists = [
    {
      id: 1,
      title: "Los Mejores Anime de Isekai 2024",
      description: "Una colección curada de los mejores anime de otro mundo que han salido este año. Perfectos para escapar de la realidad.",
      creator: {
        id: 123,
        username: "IsekaiExpert",
        avatar: "/api/placeholder/40/40",
        level: 45,
        verified: true
      },
      items: 15,
      likes: 2340,
      views: 45600,
      comments: 156,
      tags: ["Isekai", "Fantasy", "2024", "Adventure"],
      type: "anime",
      privacy: "public",
      createdAt: "2024-01-10T00:00:00Z",
      updatedAt: "2024-01-15T12:30:00Z",
      thumbnail: "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg",
      rating: 4.8,
      featured: true,
      collaborative: false,
      contents: [
        {
          id: 1,
          title: "Frieren: Beyond Journey's End",
          type: "anime",
          score: 9.2,
          image: "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg",
          note: "Una obra maestra absoluta del género"
        },
        {
          id: 2,
          title: "Re:Zero Season 3",
          type: "anime", 
          score: 8.9,
          image: "https://cdn.myanimelist.net/images/anime/1444/142248l.jpg",
          note: "El desarrollo de personajes es increíble"
        }
      ]
    },
    {
      id: 2,
      title: "Manga Psicológicos que te Volarán la Mente",
      description: "Preparate para cuestionar la realidad con estos manga que exploran los aspectos más profundos de la psique humana.",
      creator: {
        id: 456,
        username: "MindBender",
        avatar: "/api/placeholder/40/40",
        level: 67,
        verified: false
      },
      items: 23,
      likes: 1890,
      views: 28400,
      comments: 89,
      tags: ["Psychological", "Thriller", "Mind-bending", "Mature"],
      type: "manga",
      privacy: "public",
      createdAt: "2024-01-08T00:00:00Z",
      updatedAt: "2024-01-14T16:45:00Z",
      thumbnail: "https://cdn.myanimelist.net/images/manga/3/278281l.jpg",
      rating: 4.6,
      featured: false,
      collaborative: true,
      contents: [
        {
          id: 3,
          title: "Monster",
          type: "manga",
          score: 9.1,
          image: "https://cdn.myanimelist.net/images/manga/3/278281l.jpg",
          note: "La definición de un thriller psicológico perfecto"
        }
      ]
    },
    {
      id: 3,
      title: "Anime Perfectos para Principiantes",
      description: "Si eres nuevo en el anime, esta lista es tu puerta de entrada perfecta. Títulos accesibles pero de alta calidad.",
      creator: {
        id: 789,
        username: "AnimeGuide",
        avatar: "/api/placeholder/40/40",
        level: 34,
        verified: true
      },
      items: 20,
      likes: 3450,
      views: 67800,
      comments: 234,
      tags: ["Beginner-friendly", "Classic", "Gateway", "Popular"],
      type: "anime",
      privacy: "public",
      createdAt: "2024-01-05T00:00:00Z",
      updatedAt: "2024-01-12T09:15:00Z",
      thumbnail: "https://cdn.myanimelist.net/images/anime/9/9464l.jpg",
      rating: 4.9,
      featured: true,
      collaborative: false,
      contents: []
    }
  ];

  const mockUserLists = [
    {
      id: 101,
      title: "Mi Plan de Watchlist 2024",
      description: "Todos los anime que planeo ver este año",
      items: 45,
      privacy: "private",
      type: "anime",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T20:00:00Z"
    },
    {
      id: 102,
      title: "Favoritos de Todos los Tiempos",
      description: "Mis anime y manga favoritos que recomiendo a todos",
      items: 32,
      privacy: "public",
      type: "mixed",
      createdAt: "2023-12-15T00:00:00Z",
      updatedAt: "2024-01-10T14:30:00Z",
      likes: 156,
      views: 2340
    }
  ];

  const [newList, setNewList] = useState({
    title: '',
    description: '',
    type: 'anime',
    privacy: 'public',
    collaborative: false,
    tags: []
  });

  const categories = [
    { value: 'all', label: 'Todas las Listas' },
    { value: 'anime', label: 'Solo Anime' },
    { value: 'manga', label: 'Solo Manga' },
    { value: 'mixed', label: 'Mixtas' }
  ];

  const sortOptions = [
    { value: 'popularity', label: 'Más Populares' },
    { value: 'recent', label: 'Más Recientes' },
    { value: 'rating', label: 'Mejor Calificadas' },
    { value: 'name', label: 'Alfabético' }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type) => {
    const icons = {
      anime: Play,
      manga: BookOpen,
      mixed: Grid
    };
    return icons[type] || List;
  };

  const getTypeColor = (type) => {
    const colors = {
      anime: 'text-blue-400',
      manga: 'text-green-400',
      mixed: 'text-purple-400'
    };
    return colors[type] || 'text-gray-400';
  };

  const handleCreateList = () => {
    if (!newList.title.trim()) return;
    
    // Aquí iría la lógica para crear la lista
    console.log('Creating list:', newList);
    setShowCreateModal(false);
    setNewList({
      title: '',
      description: '',
      type: 'anime',
      privacy: 'public',
      collaborative: false,
      tags: []
    });
  };

  const renderCreateModal = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Crear Nueva Lista</h2>
          <button
            onClick={() => setShowCreateModal(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título de la Lista *
            </label>
            <input
              type="text"
              value={newList.title}
              onChange={(e) => setNewList(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Mis anime favoritos de acción"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              value={newList.description}
              onChange={(e) => setNewList(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe de qué trata tu lista..."
            />
          </div>

          {/* Tipo y Privacidad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Contenido
              </label>
              <select
                value={newList.type}
                onChange={(e) => setNewList(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="anime">Solo Anime</option>
                <option value="manga">Solo Manga</option>
                <option value="mixed">Anime y Manga</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Privacidad
              </label>
              <select
                value={newList.privacy}
                onChange={(e) => setNewList(prev => ({ ...prev, privacy: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">Pública</option>
                <option value="private">Privada</option>
                <option value="unlisted">No listada</option>
              </select>
            </div>
          </div>

          {/* Opciones adicionales */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={newList.collaborative}
                onChange={(e) => setNewList(prev => ({ ...prev, collaborative: e.target.checked }))}
                className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <div>
                <span className="text-gray-300 font-medium">Lista Colaborativa</span>
                <p className="text-gray-400 text-sm">Permite que otros usuarios contribuyan a tu lista</p>
              </div>
            </label>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Etiquetas (separadas por comas)
            </label>
            <input
              type="text"
              onChange={(e) => {
                const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                setNewList(prev => ({ ...prev, tags }));
              }}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: acción, shounen, recomendados"
            />
            {newList.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newList.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-600/20 text-blue-400 text-sm rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={() => setShowCreateModal(false)}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreateList}
            disabled={!newList.title.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Crear Lista
          </button>
        </div>
      </div>
    </div>
  );

  const renderListCard = (list, isUserList = false) => {
    const TypeIcon = getTypeIcon(list.type);
    
    return (
      <div key={list.id} className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-750 transition-all duration-300 group cursor-pointer">
        <div className="relative">
          {list.thumbnail ? (
            <img 
              src={list.thumbnail}
              alt={list.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
              <TypeIcon size={48} className={getTypeColor(list.type)} />
            </div>
          )}
          
          {/* Featured Badge */}
          {list.featured && (
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 bg-yellow-500 text-black text-sm font-bold rounded-full flex items-center space-x-1">
                <Crown size={14} />
                <span>Destacada</span>
              </span>
            </div>
          )}

          {/* Privacy Badge */}
          <div className="absolute top-3 right-3">
            {list.privacy === 'private' ? (
              <Lock size={16} className="text-gray-300" />
            ) : list.privacy === 'unlisted' ? (
              <Eye size={16} className="text-yellow-400" />
            ) : (
              <Globe size={16} className="text-green-400" />
            )}
          </div>

          {/* Type Badge */}
          <div className="absolute bottom-3 left-3">
            <span className={`px-2 py-1 bg-black/70 backdrop-blur-sm text-sm rounded-full flex items-center space-x-1 ${getTypeColor(list.type)}`}>
              <TypeIcon size={14} />
              <span className="capitalize">{list.type}</span>
            </span>
          </div>

          {/* Items Count */}
          <div className="absolute bottom-3 right-3">
            <span className="px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-sm rounded-full">
              {list.items} items
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
              {list.title}
            </h3>
            <button className="text-gray-400 hover:text-white p-1 rounded">
              <MoreHorizontal size={16} />
            </button>
          </div>

          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {list.description}
          </p>

          {/* Creator Info */}
          {!isUserList && list.creator && (
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={list.creator.avatar}
                alt={list.creator.username}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex items-center space-x-2">
                <span className="text-gray-300 text-sm">{list.creator.username}</span>
                {list.creator.verified && (
                  <Check size={14} className="text-blue-400" />
                )}
                <span className="text-gray-500 text-xs">Nivel {list.creator.level}</span>
              </div>
            </div>
          )}

          {/* Tags */}
          {list.tags && list.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {list.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                  {tag}
                </span>
              ))}
              {list.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                  +{list.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              {list.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="text-yellow-400 fill-current" size={14} />
                  <span className="text-white">{list.rating.toFixed(1)}</span>
                </div>
              )}
              {list.likes !== undefined && (
                <div className="flex items-center space-x-1">
                  <Heart className="text-red-400" size={14} />
                  <span className="text-gray-300">{formatNumber(list.likes)}</span>
                </div>
              )}
              {list.views !== undefined && (
                <div className="flex items-center space-x-1">
                  <Eye className="text-blue-400" size={14} />
                  <span className="text-gray-300">{formatNumber(list.views)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {list.collaborative && (
                <Users size={14} className="text-green-400" title="Lista colaborativa" />
              )}
              <span className="text-gray-400 text-xs">
                {formatDate(list.updatedAt)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-4">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
              {isUserList ? 'Editar' : 'Ver Lista'}
            </button>
            <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              <Bookmark size={16} />
            </button>
            <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              <Share2 size={16} />
            </button>
            {isUserList && (
              <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTrendingSection = () => (
    <div className="space-y-8">
      {/* Trending Lists */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">🔥 Listas Trending</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCommunityLists.filter(list => list.featured).map(list => renderListCard(list))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Categorías Populares</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Isekai', count: 156, color: 'from-purple-600 to-blue-600' },
            { name: 'Romance', count: 203, color: 'from-pink-600 to-red-600' },
            { name: 'Acción', count: 324, color: 'from-orange-600 to-yellow-600' },
            { name: 'Slice of Life', count: 98, color: 'from-green-600 to-teal-600' }
          ].map(category => (
            <div key={category.name} className={`bg-gradient-to-r ${category.color} rounded-lg p-4 text-white cursor-pointer hover:scale-105 transition-transform`}>
              <h3 className="font-semibold">{category.name}</h3>
              <p className="text-sm opacity-90">{category.count} listas</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Contributors */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Top Curadores</h2>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="space-y-4">
            {[
              { username: 'IsekaiExpert', lists: 45, followers: 12400, avatar: '/api/placeholder/40/40' },
              { username: 'MangaMaster', lists: 38, followers: 9800, avatar: '/api/placeholder/40/40' },
              { username: 'AnimeGuide', lists: 52, followers: 15600, avatar: '/api/placeholder/40/40' }
            ].map((creator, index) => (
              <div key={creator.username} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-orange-500 text-black' :
                    'bg-gray-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <img src={creator.avatar} alt={creator.username} className="w-10 h-10 rounded-full" />
                  <div>
                    <h4 className="text-white font-medium">{creator.username}</h4>
                    <p className="text-gray-400 text-sm">{creator.lists} listas • {formatNumber(creator.followers)} seguidores</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                  Seguir
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Listas de la Comunidad</h1>
          <p className="text-gray-400">Descubre, crea y comparte listas curadas de anime y manga</p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
            {[
              { id: 'discover', label: 'Descubrir', icon: TrendingUp },
              { id: 'trending', label: 'Trending', icon: Zap },
              { id: 'my-lists', label: 'Mis Listas', icon: User },
              { id: 'following', label: 'Siguiendo', icon: Users }
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

          {/* Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Plus size={20} />
            <span>Crear Lista</span>
          </button>
        </div>

        {/* Filters and Search */}
        {activeTab !== 'trending' && (
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar listas..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-4">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'trending' ? (
          renderTrendingSection()
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-6'
          }`}>
            {activeTab === 'discover' && mockCommunityLists.map(list => renderListCard(list))}
            {activeTab === 'my-lists' && mockUserLists.map(list => renderListCard(list, true))}
            {activeTab === 'following' && (
              <div className="col-span-full text-center py-12">
                <Users size={64} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No sigues a ningún curador</h3>
                <p className="text-gray-400">Comienza siguiendo a otros usuarios para ver sus listas aquí</p>
              </div>
            )}
          </div>
        )}

        {/* Create List Modal */}
        {showCreateModal && renderCreateModal()}
      </div>
    </div>
  );
};

export default ListsCurationSystem;