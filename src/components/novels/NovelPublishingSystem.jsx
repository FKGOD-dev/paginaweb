// src/components/novels/NovelPublishingSystem.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  Upload, 
  Save, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Image, 
  Tag, 
  Calendar, 
  User, 
  Star,
  MessageCircle,
  Heart,
  Share2,
  Download,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  TrendingUp,
  Clock,
  Award,
  AlertCircle,
  Check,
  X
} from 'lucide-react';

const NovelPublishingSystem = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userNovels, setUserNovels] = useState([
    {
      id: 1,
      title: "El Reino de las Sombras Eternas",
      cover: "/api/placeholder/300/400",
      synopsis: "En un mundo donde la magia y la tecnología coexisten, un joven huérfano descubre que posee el poder de controlar las sombras...",
      status: "published",
      chapters: 15,
      views: 12543,
      likes: 892,
      comments: 156,
      rating: 4.7,
      lastUpdated: "2024-01-15",
      genres: ["Fantasía", "Aventura", "Magia"],
      maturityRating: "T",
      wordCount: 125000,
      language: "es"
    },
    {
      id: 2,
      title: "Academia de Héroes Modernos",
      cover: "/api/placeholder/300/400",
      synopsis: "En una sociedad donde los superpoderes son comunes, los estudiantes de la Academia aprenden a ser los héroes del mañana...",
      status: "draft",
      chapters: 8,
      views: 0,
      likes: 0,
      comments: 0,
      rating: 0,
      lastUpdated: "2024-01-20",
      genres: ["Superhéroes", "Escolar", "Acción"],
      maturityRating: "T",
      wordCount: 67000,
      language: "es"
    }
  ]);

  const [showNewNovelForm, setShowNewNovelForm] = useState(false);
  const [editingNovel, setEditingNovel] = useState(null);
  const [newNovel, setNewNovel] = useState({
    title: '',
    synopsis: '',
    cover: null,
    genres: [],
    maturityRating: 'T',
    language: 'es',
    tags: []
  });

  const fileInputRef = useRef(null);

  const genres = [
    'Fantasía', 'Ciencia Ficción', 'Romance', 'Misterio', 'Thriller', 'Horror',
    'Aventura', 'Drama', 'Comedia', 'Acción', 'Superhéroes', 'Magia',
    'Escolar', 'Slice of Life', 'Histórico', 'Distopía', 'Cyberpunk',
    'Steampunk', 'Apocalíptico', 'Militar'
  ];

  const maturityRatings = [
    { value: 'G', label: 'General - Para todas las edades' },
    { value: 'T', label: 'Teen - Adolescentes (13+)' },
    { value: 'M', label: 'Mature - Adultos (17+)' },
    { value: 'A', label: 'Adult - Solo adultos (18+)' }
  ];

  const handleCoverUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewNovel(prev => ({
          ...prev,
          cover: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenreToggle = (genre) => {
    setNewNovel(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleSubmitNovel = () => {
    if (!newNovel.title.trim() || !newNovel.synopsis.trim()) {
      alert('Por favor completa al menos el título y la sinopsis');
      return;
    }

    const novel = {
      id: Date.now(),
      ...newNovel,
      status: 'draft',
      chapters: 0,
      views: 0,
      likes: 0,
      comments: 0,
      rating: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      wordCount: 0
    };

    setUserNovels(prev => [...prev, novel]);
    setNewNovel({
      title: '',
      synopsis: '',
      cover: null,
      genres: [],
      maturityRating: 'T',
      language: 'es',
      tags: []
    });
    setShowNewNovelForm(false);
  };

  const handleDeleteNovel = (novelId) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta novela?')) {
      setUserNovels(prev => prev.filter(novel => novel.id !== novelId));
    }
  };

  const handlePublishNovel = (novelId) => {
    setUserNovels(prev => prev.map(novel => 
      novel.id === novelId 
        ? { ...novel, status: novel.status === 'published' ? 'draft' : 'published' }
        : novel
    ));
  };

  const getStatusColor = (status) => {
    const colors = {
      'published': 'bg-green-500',
      'draft': 'bg-yellow-500',
      'reviewing': 'bg-blue-500',
      'rejected': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusText = (status) => {
    const texts = {
      'published': 'Publicada',
      'draft': 'Borrador',
      'reviewing': 'En Revisión',
      'rejected': 'Rechazada'
    };
    return texts[status] || status;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Novelas Publicadas</p>
              <p className="text-3xl font-bold">{userNovels.filter(n => n.status === 'published').length}</p>
            </div>
            <BookOpen size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Visualizaciones</p>
              <p className="text-3xl font-bold">{formatNumber(userNovels.reduce((acc, n) => acc + n.views, 0))}</p>
            </div>
            <Eye size={32} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Me Gustas</p>
              <p className="text-3xl font-bold">{formatNumber(userNovels.reduce((acc, n) => acc + n.likes, 0))}</p>
            </div>
            <Heart size={32} className="text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Comentarios</p>
              <p className="text-3xl font-bold">{formatNumber(userNovels.reduce((acc, n) => acc + n.comments, 0))}</p>
            </div>
            <MessageCircle size={32} className="text-orange-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowNewNovelForm(true)}
            className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors"
          >
            <Plus size={24} />
            <span>Nueva Novela</span>
          </button>
          
          <button className="flex items-center space-x-3 bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors">
            <Edit size={24} />
            <span>Escribir Capítulo</span>
          </button>
          
          <button className="flex items-center space-x-3 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors">
            <TrendingUp size={24} />
            <span>Ver Estadísticas</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Actividad Reciente</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Heart className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-white">Nueva reseña de 5 estrellas en "El Reino de las Sombras Eternas"</p>
              <p className="text-gray-400 text-sm">Hace 2 horas</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <MessageCircle className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-white">Nuevo comentario en el Capítulo 15</p>
              <p className="text-gray-400 text-sm">Hace 5 horas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMyNovels = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Mis Novelas</h2>
        <button 
          onClick={() => setShowNewNovelForm(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Nueva Novela</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userNovels.map(novel => (
          <div key={novel.id} className="bg-gray-800 rounded-xl overflow-hidden group hover:bg-gray-750 transition-colors">
            <div className="relative">
              <img 
                src={novel.cover} 
                alt={novel.title}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(novel.status)}`}>
                  {getStatusText(novel.status)}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="px-2 py-1 bg-black/50 text-white text-xs rounded">
                  {novel.maturityRating}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">
                {novel.title}
              </h3>
              
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                {novel.synopsis}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {novel.genres.slice(0, 3).map(genre => (
                  <span key={genre} className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                    {genre}
                  </span>
                ))}
                {novel.genres.length > 3 && (
                  <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                    +{novel.genres.length - 3}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center space-x-2">
                  <BookOpen size={16} className="text-gray-400" />
                  <span className="text-gray-300">{novel.chapters} cap.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye size={16} className="text-gray-400" />
                  <span className="text-gray-300">{formatNumber(novel.views)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart size={16} className="text-gray-400" />
                  <span className="text-gray-300">{formatNumber(novel.likes)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star size={16} className="text-gray-400" />
                  <span className="text-gray-300">{novel.rating > 0 ? novel.rating.toFixed(1) : 'N/A'}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors">
                  <Edit size={16} className="inline mr-1" />
                  Editar
                </button>
                <button 
                  onClick={() => handlePublishNovel(novel.id)}
                  className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                    novel.status === 'published' 
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {novel.status === 'published' ? 'Despublicar' : 'Publicar'}
                </button>
                <button 
                  onClick={() => handleDeleteNovel(novel.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNewNovelForm = () => (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Nueva Novela</h2>
        <button 
          onClick={() => setShowNewNovelForm(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cover Upload */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-300">
            Portada de la Novela
          </label>
          <div 
            className="w-full aspect-[3/4] bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {newNovel.cover ? (
              <img src={newNovel.cover} alt="Cover" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="text-center">
                <Image size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Haz clic para subir portada</p>
                <p className="text-gray-500 text-xs">(Recomendado: 300x400px)</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleCoverUpload(e.target.files[0])}
          />
        </div>

        {/* Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={newNovel.title}
              onChange={(e) => setNewNovel(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Título de tu novela"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sinopsis *
            </label>
            <textarea
              value={newNovel.synopsis}
              onChange={(e) => setNewNovel(prev => ({ ...prev, synopsis: e.target.value }))}
              rows={6}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe de qué trata tu novela..."
            />
            <div className="text-right text-sm text-gray-400 mt-1">
              {newNovel.synopsis.length}/1000
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Géneros
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {genres.map(genre => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    newNovel.genres.includes(genre)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Clasificación
              </label>
              <select
                value={newNovel.maturityRating}
                onChange={(e) => setNewNovel(prev => ({ ...prev, maturityRating: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {maturityRatings.map(rating => (
                  <option key={rating.value} value={rating.value}>
                    {rating.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Idioma
              </label>
              <select
                value={newNovel.language}
                onChange={(e) => setNewNovel(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button 
              onClick={() => setShowNewNovelForm(false)}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSubmitNovel}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save size={20} />
              <span>Guardar Borrador</span>
            </button>
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
          <h1 className="text-3xl font-bold text-white mb-2">Panel de Autor</h1>
          <p className="text-gray-400">Gestiona tus novelas ligeras y conecta con tus lectores</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'novels', label: 'Mis Novelas', icon: BookOpen },
            { id: 'analytics', label: 'Analíticas', icon: Award },
            { id: 'community', label: 'Comunidad', icon: MessageCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
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
        {showNewNovelForm ? renderNewNovelForm() : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'novels' && renderMyNovels()}
            {activeTab === 'analytics' && (
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <Award size={64} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Analíticas Avanzadas</h3>
                <p className="text-gray-400">Próximamente: estadísticas detalladas y métricas de rendimiento</p>
              </div>
            )}
            {activeTab === 'community' && (
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <MessageCircle size={64} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Centro de Comunidad</h3>
                <p className="text-gray-400">Próximamente: interacciones con lectores y herramientas de comunidad</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NovelPublishingSystem;