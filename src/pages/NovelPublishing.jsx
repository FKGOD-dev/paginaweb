// pages/NovelPublishing.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen,
  Edit3,
  Save,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  FileText,
  Settings,
  Users,
  TrendingUp,
  Star,
  MessageCircle,
  Heart,
  Share2,
  Download,
  Clock,
  Calendar,
  Tag,
  Plus,
  Minus,
  X,
  Check,
  AlertCircle,
  Info,
  Globe,
  Lock,
  DollarSign,
  BarChart3,
  Target,
  Award,
  Bookmark,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  MoreHorizontal,
  Trash2,
  Copy,
  RefreshCw,
  Send,
  Archive,
  Flag
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';

// Hook para manejar novelas
const useNovelPublishing = () => {
  const [userNovels, setUserNovels] = useState([]);
  const [publishedNovels, setPublishedNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    followers: 0
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Novelas del usuario
      const mockUserNovels = [
        {
          id: 1,
          title: "El Héroe Reencarnado en un Mundo de Magia",
          description: "Después de morir en un accidente, Hiroshi despierta en un mundo mágico donde debe usar sus conocimientos modernos para sobrevivir.",
          coverImage: "https://picsum.photos/300/400?random=1",
          status: "published", // draft, published, under_review
          visibility: "public", // public, private, unlisted
          tags: ["isekai", "magia", "aventura", "reencarnación"],
          genre: "Fantasía",
          targetAudience: "Young Adult",
          contentWarning: ["violencia leve"],
          language: "es",
          chapterCount: 15,
          wordCount: 75000,
          createdAt: new Date(2024, 5, 15),
          updatedAt: new Date(2025, 0, 10),
          publishedAt: new Date(2024, 6, 1),
          views: 12456,
          likes: 856,
          comments: 234,
          followers: 145,
          rating: 4.3,
          ratingCount: 67,
          isCompleted: false,
          updateSchedule: "weekly",
          chapters: [
            {
              id: 1,
              title: "Capítulo 1: Un Nuevo Comienzo",
              content: "Era una mañana como cualquier otra cuando mi vida cambió para siempre...",
              wordCount: 3500,
              publishedAt: new Date(2024, 6, 1),
              views: 2341,
              likes: 156,
              comments: 23
            },
            {
              id: 2,
              title: "Capítulo 2: El Primer Hechizo",
              content: "El poder mágico fluía por mis venas como nunca antes había sentido...",
              wordCount: 4200,
              publishedAt: new Date(2024, 6, 8),
              views: 1987,
              likes: 134,
              comments: 18
            }
          ]
        },
        {
          id: 2,
          title: "Academia de Dragones: Mi Vida como Invocador",
          description: "En una academia donde los estudiantes aprenden a invocar dragones, soy el único que no puede hacerlo... o eso creía.",
          coverImage: "https://picsum.photos/300/400?random=2",
          status: "draft",
          visibility: "private",
          tags: ["academia", "dragones", "magia", "school life"],
          genre: "Fantasía/Romance",
          targetAudience: "Young Adult",
          contentWarning: [],
          language: "es",
          chapterCount: 3,
          wordCount: 15000,
          createdAt: new Date(2024, 11, 1),
          updatedAt: new Date(2025, 0, 5),
          publishedAt: null,
          views: 0,
          likes: 0,
          comments: 0,
          followers: 0,
          rating: 0,
          ratingCount: 0,
          isCompleted: false,
          updateSchedule: "biweekly",
          chapters: [
            {
              id: 3,
              title: "Capítulo 1: Sin Talento",
              content: "Todos en la academia podían invocar al menos un pequeño dragón...",
              wordCount: 5000,
              publishedAt: null,
              views: 0,
              likes: 0,
              comments: 0
            }
          ]
        }
      ];

      // Novelas populares de otros usuarios
      const mockPublishedNovels = [
        {
          id: 3,
          title: "Rey Demonio Retirado",
          description: "Después de 1000 años siendo el Rey Demonio, decidí retirarme y vivir una vida pacífica como granjero.",
          coverImage: "https://picsum.photos/300/400?random=3",
          author: {
            id: 2,
            username: "NovelistPro",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=author1",
            level: 28,
            verified: true
          },
          tags: ["comedia", "slice of life", "demonio", "retiro"],
          genre: "Comedia/Fantasía",
          chapterCount: 45,
          wordCount: 180000,
          views: 45678,
          likes: 3456,
          comments: 892,
          followers: 1234,
          rating: 4.7,
          ratingCount: 234,
          publishedAt: new Date(2024, 2, 15),
          updatedAt: new Date(2025, 0, 8),
          isCompleted: false
        },
        {
          id: 4,
          title: "Alquimista del Apocalipsis",
          description: "En un mundo post-apocalíptico, uso mis habilidades de alquimia para sobrevivir y reconstruir la civilización.",
          coverImage: "https://picsum.photos/300/400?random=4",
          author: {
            id: 3,
            username: "ApocalypseWriter",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=author2",
            level: 22,
            verified: false
          },
          tags: ["apocalipsis", "alquimia", "supervivencia", "ciencia"],
          genre: "Ciencia Ficción",
          chapterCount: 28,
          wordCount: 145000,
          views: 23456,
          likes: 1876,
          comments: 456,
          followers: 678,
          rating: 4.4,
          ratingCount: 156,
          publishedAt: new Date(2024, 4, 20),
          updatedAt: new Date(2025, 0, 12),
          isCompleted: false
        }
      ];

      setUserNovels(mockUserNovels);
      setPublishedNovels(mockPublishedNovels);
      setStats({
        totalViews: mockUserNovels.reduce((sum, novel) => sum + novel.views, 0),
        totalLikes: mockUserNovels.reduce((sum, novel) => sum + novel.likes, 0),
        totalComments: mockUserNovels.reduce((sum, novel) => sum + novel.comments, 0),
        followers: mockUserNovels.reduce((sum, novel) => sum + novel.followers, 0)
      });
      setLoading(false);
    };

    loadData();
  }, []);

  const createNovel = (novelData) => {
    const newNovel = {
      ...novelData,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: null,
      chapterCount: 0,
      wordCount: 0,
      views: 0,
      likes: 0,
      comments: 0,
      followers: 0,
      rating: 0,
      ratingCount: 0,
      chapters: []
    };
    
    setUserNovels(prev => [newNovel, ...prev]);
    return newNovel;
  };

  const updateNovel = (novelId, updates) => {
    setUserNovels(prev => prev.map(novel => 
      novel.id === novelId 
        ? { ...novel, ...updates, updatedAt: new Date() }
        : novel
    ));
  };

  const deleteNovel = (novelId) => {
    setUserNovels(prev => prev.filter(novel => novel.id !== novelId));
  };

  const publishNovel = (novelId) => {
    setUserNovels(prev => prev.map(novel => 
      novel.id === novelId 
        ? { 
            ...novel, 
            status: 'published', 
            publishedAt: new Date(),
            visibility: 'public'
          }
        : novel
    ));
  };

  return {
    userNovels,
    publishedNovels,
    loading,
    stats,
    createNovel,
    updateNovel,
    deleteNovel,
    publishNovel
  };
};

const NovelPublishing = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNovel, setSelectedNovel] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  const {
    userNovels,
    publishedNovels,
    loading,
    stats,
    createNovel,
    updateNovel,
    deleteNovel,
    publishNovel
  } = useNovelPublishing();

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="container mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                  <div className="h-48 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
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
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-purple-600" />
              Centro de Publicación
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Escribe, publica y comparte tus novelas ligeras con la comunidad
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Novela
          </button>
        </div>

        {/* Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full lg:w-auto grid-cols-4 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="my-novels">Mis Novelas</TabsTrigger>
            <TabsTrigger value="discover">Descubrir</TabsTrigger>
            <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                title="Visualizaciones Totales"
                value={formatNumber(stats.totalViews)}
                icon={<Eye className="w-6 h-6 text-blue-600" />}
                color="blue"
              />
              <StatCard
                title="Me Gusta Totales"
                value={formatNumber(stats.totalLikes)}
                icon={<Heart className="w-6 h-6 text-red-600" />}
                color="red"
              />
              <StatCard
                title="Comentarios Totales"
                value={formatNumber(stats.totalComments)}
                icon={<MessageCircle className="w-6 h-6 text-green-600" />}
                color="green"
              />
              <StatCard
                title="Seguidores Totales"
                value={formatNumber(stats.followers)}
                icon={<Users className="w-6 h-6 text-purple-600" />}
                color="purple"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Novels */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Novelas Recientes
                </h3>
                <div className="space-y-4">
                  {userNovels.slice(0, 3).map(novel => (
                    <div key={novel.id} className="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                      <img
                        src={novel.coverImage}
                        alt={novel.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {novel.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {novel.chapterCount} capítulos • {formatNumber(novel.wordCount)} palabras
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            novel.status === 'published' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : novel.status === 'draft'
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          }`}>
                            {novel.status === 'published' ? 'Publicado' : 
                             novel.status === 'draft' ? 'Borrador' : 'En revisión'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatNumber(novel.views)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          visualizaciones
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Chart Placeholder */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Rendimiento de Novelas
                </h3>
                <div className="text-center py-8">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Gráficos de analíticas próximamente
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* My Novels */}
          <TabsContent value="my-novels" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Mis Novelas ({userNovels.length})
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {userNovels.length > 0 ? (
              viewMode === 'grid' ? (
                <NovelGrid 
                  novels={userNovels} 
                  onEdit={setSelectedNovel}
                  onDelete={deleteNovel}
                  onPublish={publishNovel}
                  showOwnerActions={true}
                />
              ) : (
                <NovelList 
                  novels={userNovels} 
                  onEdit={setSelectedNovel}
                  onDelete={deleteNovel}
                  onPublish={publishNovel}
                  showOwnerActions={true}
                />
              )
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No tienes novelas aún
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Comienza tu carrera como escritor creando tu primera novela
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Crear Primera Novela
                </button>
              </div>
            )}
          </TabsContent>

          {/* Discover */}
          <TabsContent value="discover" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Descubrir Novelas
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar novelas..."
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white w-64"
                  />
                </div>
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white">
                  <option value="popularity">Más populares</option>
                  <option value="recent">Más recientes</option>
                  <option value="rating">Mejor valoradas</option>
                  <option value="views">Más vistas</option>
                </select>
              </div>
            </div>

            <NovelGrid 
              novels={publishedNovels} 
              showOwnerActions={false}
            />
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analíticas Detalladas
            </h2>
            
            <div className="text-center py-16">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Analíticas Avanzadas
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sistema de analíticas detalladas próximamente disponible
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {showCreateModal && (
          <CreateNovelModal 
            onClose={() => setShowCreateModal(false)}
            onCreateNovel={createNovel}
          />
        )}

        {selectedNovel && (
          <NovelEditorModal 
            novel={selectedNovel}
            onClose={() => setSelectedNovel(null)}
            onUpdateNovel={updateNovel}
          />
        )}
      </div>
    </div>
  );
};

// Componente de estadística
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    red: 'bg-red-50 dark:bg-red-900/20',
    green: 'bg-green-50 dark:bg-green-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Grid de novelas
const NovelGrid = ({ novels, onEdit, onDelete, onPublish, showOwnerActions = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {novels.map(novel => (
        <NovelCard
          key={novel.id}
          novel={novel}
          onEdit={onEdit}
          onDelete={onDelete}
          onPublish={onPublish}
          showOwnerActions={showOwnerActions}
        />
      ))}
    </div>
  );
};

// Lista de novelas
const NovelList = ({ novels, onEdit, onDelete, onPublish, showOwnerActions = false }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Novela
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estadísticas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Última actualización
              </th>
              {showOwnerActions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {novels.map(novel => (
              <tr key={novel.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={novel.coverImage}
                      alt={novel.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {novel.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {novel.chapterCount} capítulos
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    novel.status === 'published' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : novel.status === 'draft'
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {novel.status === 'published' ? 'Publicado' : 
                     novel.status === 'draft' ? 'Borrador' : 'En revisión'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {novel.views.toLocaleString()} vistas
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {novel.likes} me gusta • {novel.comments} comentarios
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Intl.DateTimeFormat('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }).format(novel.updatedAt)}
                </td>
                {showOwnerActions && (
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit && onEdit(novel)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {novel.status === 'draft' && (
                        <button
                          onClick={() => onPublish && onPublish(novel.id)}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete && onDelete(novel.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Card individual de novela
const NovelCard = ({ novel, onEdit, onDelete, onPublish, showOwnerActions = false }) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={novel.coverImage}
          alt={novel.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            novel.status === 'published' 
              ? 'bg-green-500 text-white'
              : novel.status === 'draft'
              ? 'bg-gray-500 text-white'
              : 'bg-yellow-500 text-black'
          }`}>
            {novel.status === 'published' ? 'Publicado' : 
             novel.status === 'draft' ? 'Borrador' : 'En revisión'}
          </span>
        </div>

        {/* Privacy indicator */}
        <div className="absolute top-2 right-2">
          {novel.visibility === 'public' ? (
            <Globe className="w-5 h-5 text-white" title="Público" />
          ) : novel.visibility === 'private' ? (
            <Lock className="w-5 h-5 text-white" title="Privado" />
          ) : (
            <EyeOff className="w-5 h-5 text-white" title="No listado" />
          )}
        </div>

        {/* Menu button */}
        {showOwnerActions && (
          <div className="absolute bottom-2 right-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 bottom-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 w-40 z-10">
                <button
                  onClick={() => {
                    onEdit && onEdit(novel);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar
                </button>
                {novel.status === 'draft' && (
                  <button
                    onClick={() => {
                      onPublish && onPublish(novel.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Send className="w-4 h-4" />
                    Publicar
                  </button>
                )}
                <button
                  onClick={() => {
                    onDelete && onDelete(novel.id);
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
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {novel.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {novel.description}
        </p>

        {/* Author info (for discover mode) */}
        {novel.author && (
          <div className="flex items-center gap-2 mb-3">
            <img
              src={novel.author.avatar}
              alt={novel.author.username}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {novel.author.username}
            </span>
            {novel.author.verified && (
              <Check className="w-4 h-4 text-blue-500" />
            )}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {novel.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
          {novel.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
              +{novel.tags.length - 3}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{novel.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{novel.likes}</span>
            </div>
            {novel.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>{novel.rating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Chapter info */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between items-center">
            <span>{novel.chapterCount} capítulos</span>
            <span>{(novel.wordCount / 1000).toFixed(0)}K palabras</span>
          </div>
          <div className="text-xs mt-1">
            Actualizado: {formatDate(novel.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal para crear nueva novela
const CreateNovelModal = ({ onClose, onCreateNovel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    targetAudience: '',
    tags: [],
    coverImage: '',
    visibility: 'private',
    contentWarning: [],
    language: 'es'
  });
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onCreateNovel({
      ...formData,
      status: 'draft',
      coverImage: formData.coverImage || 'https://picsum.photos/300/400?random=' + Date.now()
    });
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 10) {
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
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Crear Nueva Novela
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="El título de tu novela"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Género
                </label>
                <select
                  value={formData.genre}
                  onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Seleccionar género</option>
                  <option value="Fantasía">Fantasía</option>
                  <option value="Ciencia Ficción">Ciencia Ficción</option>
                  <option value="Romance">Romance</option>
                  <option value="Aventura">Aventura</option>
                  <option value="Misterio">Misterio</option>
                  <option value="Drama">Drama</option>
                  <option value="Comedia">Comedia</option>
                  <option value="Slice of Life">Slice of Life</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Audiencia objetivo
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Seleccionar audiencia</option>
                  <option value="General">General</option>
                  <option value="Young Adult">Young Adult</option>
                  <option value="Adulto">Adulto</option>
                  <option value="Teen">Teen</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows="4"
                placeholder="Describe tu novela..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (máximo 10)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Agregar tag..."
                  disabled={formData.tags.length >= 10}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={formData.tags.length >= 10}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-full text-sm flex items-center gap-1"
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

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Imagen de portada (URL)
              </label>
              <input
                type="url"
                value={formData.coverImage}
                onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="https://ejemplo.com/portada.jpg"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Si no especificas una imagen, se generará una automáticamente
              </p>
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Visibilidad
              </label>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="private">Privada (solo tú puedes verla)</option>
                <option value="unlisted">No listada (solo con enlace directo)</option>
                <option value="public">Pública (visible para todos)</option>
              </select>
            </div>

            {/* Submit buttons */}
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
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Crear Novela
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Modal del editor de novelas (simplificado)
const NovelEditorModal = ({ novel, onClose, onUpdateNovel }) => {
  const [activeSection, setActiveSection] = useState('info');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Editar: {novel.title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('info')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeSection === 'info'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <Info className="w-4 h-4 inline mr-2" />
                Información
              </button>
              <button
                onClick={() => setActiveSection('chapters')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeSection === 'chapters'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Capítulos ({novel.chapterCount})
              </button>
              <button
                onClick={() => setActiveSection('analytics')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeSection === 'analytics'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Analíticas
              </button>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeSection === 'info' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Información de la Novela
                </h4>
                <div className="text-center py-8">
                  <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Editor de información próximamente
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'chapters' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Gestión de Capítulos
                  </h4>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nuevo Capítulo
                  </button>
                </div>
                
                <div className="space-y-3">
                  {novel.chapters?.map((chapter, index) => (
                    <div key={chapter.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {chapter.title}
                          </h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {chapter.wordCount} palabras • {chapter.views} vistas
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-700 dark:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'analytics' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Analíticas de la Novela
                </h4>
                <div className="text-center py-8">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Analíticas detalladas próximamente
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovelPublishing;