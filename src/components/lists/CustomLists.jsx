// components/lists/CustomLists.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus,
  List,
  Heart,
  Star,
  Eye,
  Clock,
  BookOpen,
  Play,
  Users,
  Share2,
  Edit3,
  Trash2,
  MoreHorizontal,
  Filter,
  Search,
  Grid,
  ThumbsUp,
  MessageCircle,
  Copy,
  Lock,
  Unlock,
  Tag,
  Calendar,
  TrendingUp,
  Award,
  X,
  Check,
  Image as ImageIcon,
  Globe,
  UserPlus
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';

// Hook para manejar listas
export const useCustomLists = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de listas
    const loadLists = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockLists = [
        {
          id: 1,
          title: "Anime de Acción Épicos",
          description: "Los mejores anime de acción que te dejarán sin aliento. Peleas épicas, poderes sobrenaturales y momentos que te pondrán los pelos de punta.",
          coverImage: "https://picsum.photos/400/600?random=1",
          isPublic: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          itemCount: 25,
          followers: 342,
          likes: 156,
          comments: 23,
          tags: ["acción", "shonen", "poderes", "épico"],
          items: [
            { id: 1, title: "Attack on Titan", image: "https://picsum.photos/300/400?random=10", rating: 9.2, type: "anime" },
            { id: 2, title: "Demon Slayer", image: "https://picsum.photos/300/400?random=11", rating: 8.8, type: "anime" },
            { id: 3, title: "Jujutsu Kaisen", image: "https://picsum.photos/300/400?random=12", rating: 9.0, type: "anime" }
          ],
          creator: {
            id: 1,
            username: "OtakuMaster2024",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
            level: 25
          }
        },
        {
          id: 2,
          title: "Mangas con MC Overpowered",
          description: "Protagonistas tan poderosos que rompen la escala de poder. Perfectos para cuando quieres ver dominio absoluto.",
          coverImage: "https://picsum.photos/400/600?random=2",
          isPublic: true,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          itemCount: 18,
          followers: 189,
          likes: 89,
          comments: 12,
          tags: ["overpowered", "manga", "protagonista fuerte"],
          items: [
            { id: 4, title: "One Punch Man", image: "https://picsum.photos/300/400?random=13", rating: 8.9, type: "manga" },
            { id: 5, title: "Solo Leveling", image: "https://picsum.photos/300/400?random=14", rating: 9.1, type: "manga" }
          ],
          creator: {
            id: 2,
            username: "MangaExpert",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=expert",
            level: 32
          }
        },
        {
          id: 3,
          title: "Mis Favoritos Personales",
          description: "Mi colección personal de anime y manga que más me han marcado a lo largo de los años.",
          coverImage: "https://picsum.photos/400/600?random=3",
          isPublic: false,
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          itemCount: 42,
          followers: 0,
          likes: 0,
          comments: 0,
          tags: ["favoritos", "personal", "clásicos"],
          items: [
            { id: 6, title: "One Piece", image: "https://picsum.photos/300/400?random=15", rating: 9.5, type: "manga" },
            { id: 7, title: "Naruto", image: "https://picsum.photos/300/400?random=16", rating: 8.7, type: "anime" }
          ],
          creator: {
            id: 1,
            username: "OtakuMaster2024",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
            level: 25
          }
        }
      ];

      setLists(mockLists);
      setLoading(false);
    };

    loadLists();
  }, []);

  const createList = (listData) => {
    const newList = {
      ...listData,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
      itemCount: 0,
      followers: 0,
      likes: 0,
      comments: 0,
      items: [],
      creator: {
        id: 1,
        username: "OtakuMaster2024",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
        level: 25
      }
    };
    
    setLists(prev => [newList, ...prev]);
    return newList;
  };

  const updateList = (listId, updates) => {
    setLists(prev => prev.map(list => 
      list.id === listId 
        ? { ...list, ...updates, updatedAt: new Date() }
        : list
    ));
  };

  const deleteList = (listId) => {
    setLists(prev => prev.filter(list => list.id !== listId));
  };

  const addItemToList = (listId, item) => {
    setLists(prev => prev.map(list => 
      list.id === listId
        ? { 
            ...list, 
            items: [...list.items, item],
            itemCount: list.itemCount + 1,
            updatedAt: new Date()
          }
        : list
    ));
  };

  const removeItemFromList = (listId, itemId) => {
    setLists(prev => prev.map(list => 
      list.id === listId
        ? { 
            ...list, 
            items: list.items.filter(item => item.id !== itemId),
            itemCount: list.itemCount - 1,
            updatedAt: new Date()
          }
        : list
    ));
  };

  return {
    lists,
    loading,
    createList,
    updateList,
    deleteList,
    addItemToList,
    removeItemFromList
  };
};

const CustomLists = () => {
  const [activeTab, setActiveTab] = useState('my-lists');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [filterBy, setFilterBy] = useState('all');

  const { 
    lists, 
    loading, 
    createList, 
    updateList, 
    deleteList 
  } = useCustomLists();

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor(diff / (60 * 60 * 1000));
    
    if (days > 0) return `hace ${days} día${days !== 1 ? 's' : ''}`;
    if (hours > 0) return `hace ${hours} hora${hours !== 1 ? 's' : ''}`;
    return 'hace un momento';
  };

  const getFilteredLists = () => {
    let filtered = lists;

    // Filtrar por pestaña
    if (activeTab === 'my-lists') {
      filtered = filtered.filter(list => list.creator.id === 1); // ID del usuario actual
    } else if (activeTab === 'following') {
      // Simular listas que sigue el usuario
      filtered = filtered.filter(list => list.creator.id !== 1);
    } else if (activeTab === 'popular') {
      filtered = filtered.filter(list => list.isPublic);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(list => 
        list.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        list.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        list.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por tipo
    if (filterBy !== 'all') {
      if (filterBy === 'public') {
        filtered = filtered.filter(list => list.isPublic);
      } else if (filterBy === 'private') {
        filtered = filtered.filter(list => !list.isPublic);
      }
    }

    // Ordenar
    switch (sortBy) {
      case 'created':
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'updated':
        return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      case 'popularity':
        return filtered.sort((a, b) => (b.followers + b.likes) - (a.followers + a.likes));
      case 'size':
        return filtered.sort((a, b) => b.itemCount - a.itemCount);
      default:
        return filtered;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md animate-pulse">
                <div className="h-48 bg-gray-300 dark:bg-gray-600"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <List className="w-8 h-8 text-blue-600" />
              Listas Personalizadas
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Crea, organiza y comparte tus colecciones favoritas de anime y manga
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Lista
          </button>
        </div>

        {/* Tabs y controles */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <TabsList className="grid w-full lg:w-auto grid-cols-3">
              <TabsTrigger value="my-lists">Mis Listas</TabsTrigger>
              <TabsTrigger value="following">Siguiendo</TabsTrigger>
              <TabsTrigger value="popular">Populares</TabsTrigger>
            </TabsList>

            {/* Controles de búsqueda y filtros */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar listas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white w-full sm:w-64"
                />
              </div>
              
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              >
                <option value="all">Todas</option>
                <option value="public">Públicas</option>
                <option value="private">Privadas</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              >
                <option value="updated">Última actualización</option>
                <option value="created">Fecha de creación</option>
                <option value="popularity">Popularidad</option>
                <option value="size">Tamaño</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <TabsContent value="my-lists">
            <ListGrid 
              lists={getFilteredLists()} 
              onListClick={setSelectedList}
              onEditList={(list) => console.log('Edit list:', list)}
              onDeleteList={deleteList}
              showOwnerActions={true}
            />
          </TabsContent>

          <TabsContent value="following">
            <ListGrid 
              lists={getFilteredLists()} 
              onListClick={setSelectedList}
              showOwnerActions={false}
            />
          </TabsContent>

          <TabsContent value="popular">
            <ListGrid 
              lists={getFilteredLists()} 
              onListClick={setSelectedList}
              showOwnerActions={false}
            />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {showCreateModal && (
          <CreateListModal 
            onClose={() => setShowCreateModal(false)}
            onCreateList={createList}
          />
        )}

        {selectedList && (
          <ListDetailModal 
            list={selectedList}
            onClose={() => setSelectedList(null)}
          />
        )}
      </div>
    </div>
  );
};

// Grid de listas
const ListGrid = ({ lists, onListClick, onEditList, onDeleteList, showOwnerActions }) => {
  if (lists.length === 0) {
    return (
      <div className="text-center py-16">
        <List className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No hay listas aquí
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Crea tu primera lista para organizar tu contenido favorito
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lists.map(list => (
        <ListCard
          key={list.id}
          list={list}
          onClick={() => onListClick(list)}
          onEdit={onEditList}
          onDelete={onDeleteList}
          showOwnerActions={showOwnerActions}
        />
      ))}
    </div>
  );
};

// Card individual de lista
const ListCard = ({ list, onClick, onEdit, onDelete, showOwnerActions }) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor(diff / (60 * 60 * 1000));
    
    if (days > 0) return `hace ${days} día${days !== 1 ? 's' : ''}`;
    if (hours > 0) return `hace ${hours} hora${hours !== 1 ? 's' : ''}`;
    return 'hace un momento';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group">
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={list.coverImage}
          alt={list.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Privacy indicator */}
        <div className="absolute top-3 left-3">
          {list.isPublic ? (
            <Globe className="w-5 h-5 text-white" title="Lista pública" />
          ) : (
            <Lock className="w-5 h-5 text-white" title="Lista privada" />
          )}
        </div>

        {/* Menu */}
        {showOwnerActions && (
          <div className="absolute top-3 right-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 w-40 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit && onEdit(list);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete && onDelete(list.id);
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
        )}

        {/* Item count */}
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-sm">
          {list.itemCount} elementos
        </div>
      </div>

      {/* Content */}
      <div className="p-4" onClick={onClick}>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {list.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {list.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {list.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
          {list.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
              +{list.tags.length - 3} más
            </span>
          )}
        </div>

        {/* Creator info */}
        <div className="flex items-center gap-2 mb-3">
          <img
            src={list.creator.avatar}
            alt={list.creator.username}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {list.creator.username}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            Nivel {list.creator.level}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            {list.isPublic && (
              <>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{list.followers}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{list.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{list.comments}</span>
                </div>
              </>
            )}
          </div>
          <span className="text-xs">
            {formatTimeAgo(list.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

// Modal para crear nueva lista
const CreateListModal = ({ onClose, onCreateList }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: true,
    tags: [],
    coverImage: ''
  });
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onCreateList({
      ...formData,
      coverImage: formData.coverImage || 'https://picsum.photos/400/600?random=' + Date.now()
    });
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Crear Nueva Lista
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Ej: Mis anime favoritos de 2024"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows="3"
                placeholder="Describe tu lista..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Agregar tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Imagen de portada (URL)
              </label>
              <input
                type="url"
                value={formData.coverImage}
                onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Si no especificas una imagen, se generará una automáticamente
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
                Lista pública (otros usuarios podrán verla y seguirla)
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Lista
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Modal de detalle de lista
const ListDetailModal = ({ list, onClose }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [showItems, setShowItems] = useState(true);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative h-48 bg-cover bg-center" style={{ backgroundImage: `url(${list.coverImage})` }}>
          <div className="absolute inset-0 bg-black/60" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute bottom-4 left-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              {list.isPublic ? (
                <Globe className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
              <span className="text-sm">{list.isPublic ? 'Pública' : 'Privada'}</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{list.title}</h2>
            <p className="text-gray-200">{list.itemCount} elementos</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Info section */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-300 mb-4">{list.description}</p>
                
                {/* Creator */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={list.creator.avatar}
                    alt={list.creator.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {list.creator.username}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      Nivel {list.creator.level}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {list.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {list.isPublic && (
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isFollowing
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isFollowing ? 'Siguiendo' : 'Seguir'}
                  </button>
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            {list.isPublic && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{list.followers}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Seguidores</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{list.likes}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Me gusta</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{list.comments}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Comentarios</div>
                </div>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Contenido de la lista
            </h3>
            
            {list.items.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {list.items.map((item) => (
                  <div key={item.id} className="group cursor-pointer">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-32 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                    />
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white mt-2 line-clamp-2">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{item.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  Esta lista aún no tiene elementos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomLists;