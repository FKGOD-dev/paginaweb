import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Grid, 
  List, 
  Search, 
  Star, 
  Eye, 
  Heart, 
  Calendar,
  ChevronDown,
  X,
  SlidersHorizontal,
  Bookmark,
  Play,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';

const BrowsePage = () => {
  const [mangas, setMangas] = useState([]);
  const [filteredMangas, setFilteredMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtros
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    genres: [],
    year: '',
    rating: '',
    sortBy: 'popularity'
  });

  // Datos de filtros
  const filterOptions = {
    types: [
      { value: '', label: 'Todos los tipos' },
      { value: 'manga', label: 'Manga' },
      { value: 'manhwa', label: 'Manhwa' },
      { value: 'manhua', label: 'Manhua' },
      { value: 'anime', label: 'Anime' }
    ],
    statuses: [
      { value: '', label: 'Todos los estados' },
      { value: 'ongoing', label: 'En curso' },
      { value: 'completed', label: 'Completado' },
      { value: 'hiatus', label: 'En pausa' },
      { value: 'cancelled', label: 'Cancelado' }
    ],
    genres: [
      'Acción', 'Aventura', 'Comedia', 'Drama', 'Romance', 'Fantasía',
      'Sci-Fi', 'Horror', 'Misterio', 'Deportes', 'Slice of Life',
      'Shounen', 'Shoujo', 'Seinen', 'Josei', 'Ecchi', 'Harem',
      'Sobrenatural', 'Psicológico', 'Histórico', 'Militar', 'Escolar'
    ],
    years: Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i),
    sortOptions: [
      { value: 'popularity', label: 'Popularidad' },
      { value: 'rating', label: 'Calificación' },
      { value: 'latest', label: 'Más reciente' },
      { value: 'alphabetical', label: 'A-Z' },
      { value: 'year', label: 'Año' },
      { value: 'views', label: 'Más visto' }
    ]
  };

  // Mock data
  const mockMangas = [
    {
      id: 1,
      title: "One Piece",
      cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
      author: "Eiichiro Oda",
      rating: 9.2,
      year: 1997,
      status: "ongoing",
      type: "manga",
      genres: ["Acción", "Aventura", "Comedia"],
      views: 15420000,
      favorites: 892000,
      chapters: 1100,
      synopsis: "Las aventuras de Monkey D. Luffy en busca del tesoro One Piece.",
      isTrending: true,
      lastUpdate: "2025-06-16"
    },
    {
      id: 2,
      title: "Solo Leveling",
      cover: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=300&h=400&fit=crop",
      author: "Chugong",
      rating: 9.4,
      year: 2018,
      status: "completed",
      type: "manhwa",
      genres: ["Acción", "Fantasía", "Aventura"],
      views: 18200000,
      favorites: 950000,
      chapters: 179,
      synopsis: "Un cazador débil se convierte en el más poderoso.",
      isTrending: true,
      lastUpdate: "2025-06-15"
    },
    {
      id: 3,
      title: "Attack on Titan",
      cover: "https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=300&h=400&fit=crop",
      author: "Hajime Isayama",
      rating: 9.0,
      year: 2009,
      status: "completed",
      type: "manga",
      genres: ["Acción", "Drama", "Horror"],
      views: 12500000,
      favorites: 750000,
      chapters: 139,
      synopsis: "La humanidad lucha por sobrevivir contra los titanes.",
      isTrending: false,
      lastUpdate: "2025-06-10"
    },
    {
      id: 4,
      title: "Demon Slayer",
      cover: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=300&h=400&fit=crop",
      author: "Koyoharu Gotouge",
      rating: 8.8,
      year: 2016,
      status: "completed",
      type: "manga",
      genres: ["Acción", "Sobrenatural", "Histórico"],
      views: 14800000,
      favorites: 680000,
      chapters: 205,
      synopsis: "Un joven se convierte en cazador de demonios para salvar a su hermana.",
      isTrending: true,
      lastUpdate: "2025-06-12"
    },
    {
      id: 5,
      title: "Jujutsu Kaisen",
      cover: "https://images.unsplash.com/photo-1596003906949-67221c37965c?w=300&h=400&fit=crop",
      author: "Gege Akutami",
      rating: 8.9,
      year: 2018,
      status: "ongoing",
      type: "manga",
      genres: ["Acción", "Sobrenatural", "Escolar"],
      views: 13200000,
      favorites: 620000,
      chapters: 245,
      synopsis: "Estudiantes luchan contra maldiciones sobrenaturales.",
      isTrending: true,
      lastUpdate: "2025-06-17"
    },
    {
      id: 6,
      title: "Tower of God",
      cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
      author: "SIU",
      rating: 8.7,
      year: 2010,
      status: "ongoing",
      type: "manhwa",
      genres: ["Aventura", "Fantasía", "Drama"],
      views: 11500000,
      favorites: 580000,
      chapters: 567,
      synopsis: "Un chico asciende por una misteriosa torre para encontrar a su amiga.",
      isTrending: false,
      lastUpdate: "2025-06-16"
    }
  ];

  useEffect(() => {
    loadMangas();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [mangas, filters, searchQuery]);

  const loadMangas = async () => {
    try {
      setLoading(true);
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMangas(mockMangas);
      setTotalPages(Math.ceil(mockMangas.length / 20));
    } catch (error) {
      console.error('Error loading mangas:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...mangas];

    // Filtro de búsqueda
    if (searchQuery) {
      filtered = filtered.filter(manga =>
        manga.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        manga.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        manga.genres.some(genre => 
          genre.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filtro de tipo
    if (filters.type) {
      filtered = filtered.filter(manga => manga.type === filters.type);
    }

    // Filtro de estado
    if (filters.status) {
      filtered = filtered.filter(manga => manga.status === filters.status);
    }

    // Filtro de géneros
    if (filters.genres.length > 0) {
      filtered = filtered.filter(manga =>
        filters.genres.some(genre => manga.genres.includes(genre))
      );
    }

    // Filtro de año
    if (filters.year) {
      filtered = filtered.filter(manga => manga.year === parseInt(filters.year));
    }

    // Filtro de rating
    if (filters.rating) {
      filtered = filtered.filter(manga => manga.rating >= parseFloat(filters.rating));
    }

    // Ordenamiento
    switch (filters.sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'latest':
        filtered.sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'year':
        filtered.sort((a, b) => b.year - a.year);
        break;
      case 'views':
        filtered.sort((a, b) => b.views - a.views);
        break;
      default: // popularity
        filtered.sort((a, b) => b.favorites - a.favorites);
    }

    setFilteredMangas(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleGenreToggle = (genre) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      genres: [],
      year: '',
      rating: '',
      sortBy: 'popularity'
    });
    setSearchQuery('');
  };

  const MangaGridItem = ({ manga }) => (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-lg bg-gray-800 transition-transform group-hover:scale-105">
        <img
          src={manga.cover}
          alt={manga.title}
          className="w-full h-64 object-cover"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-12 h-12 text-white" />
        </div>
        
        {/* Rating */}
        <div className="absolute top-2 right-2 bg-black/70 rounded px-2 py-1">
          <div className="flex items-center text-yellow-500">
            <Star className="w-3 h-3 mr-1 fill-current" />
            <span className="text-xs text-white">{manga.rating}</span>
          </div>
        </div>
        
        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            manga.type === 'manga' ? 'bg-blue-500' : 
            manga.type === 'manhwa' ? 'bg-green-500' : 
            manga.type === 'manhua' ? 'bg-purple-500' : 'bg-red-500'
          }`}>
            {manga.type.toUpperCase()}
          </span>
        </div>
        
        {/* Trending indicator */}
        {manga.isTrending && (
          <div className="absolute bottom-2 left-2">
            <div className="flex items-center bg-orange-500 rounded px-2 py-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span className="text-xs font-medium">HOT</span>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-red-500 hover:bg-red-600 p-2 rounded-full transition-colors">
            <Heart className="w-4 h-4" />
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 p-2 rounded-full transition-colors">
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="mt-3">
        <h3 className="text-white font-semibold line-clamp-2 mb-1">{manga.title}</h3>
        <p className="text-gray-400 text-sm mb-2">{manga.author}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {manga.genres.slice(0, 2).map((genre, index) => (
            <span key={index} className="px-2 py-1 bg-gray-700 text-xs rounded">
              {genre}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{manga.chapters} caps</span>
          <span>{manga.year}</span>
        </div>
      </div>
    </div>
  );

  const MangaListItem = ({ manga }) => (
    <div className="flex bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors group cursor-pointer">
      <img
        src={manga.cover}
        alt={manga.title}
        className="w-20 h-28 object-cover rounded"
      />
      
      <div className="ml-4 flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-white font-semibold text-lg mb-1">{manga.title}</h3>
            <p className="text-gray-400 text-sm">{manga.author}</p>
          </div>
          <div className="flex items-center text-yellow-500">
            <Star className="w-4 h-4 mr-1 fill-current" />
            <span className="font-medium">{manga.rating}</span>
          </div>
        </div>
        
        <p className="text-gray-300 text-sm line-clamp-2 mb-3">{manga.synopsis}</p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {manga.genres.slice(0, 4).map((genre, index) => (
            <span key={index} className="px-2 py-1 bg-blue-600 text-xs rounded">
              {genre}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {(manga.views / 1000000).toFixed(1)}M
            </div>
            <div className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              {(manga.favorites / 1000).toFixed(0)}K
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {manga.year}
            </div>
            <span className={`px-2 py-1 rounded text-xs ${
              manga.type === 'manga' ? 'bg-blue-500' : 
              manga.type === 'manhwa' ? 'bg-green-500' : 'bg-purple-500'
            }`}>
              {manga.type.toUpperCase()}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium transition-colors">
              Leer
            </button>
            <button className="bg-gray-600 hover:bg-gray-500 p-2 rounded transition-colors">
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Explorar Manga</h1>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar manga, autor o género..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtros
                {(filters.genres.length > 0 || filters.type || filters.status || filters.year || filters.rating) && (
                  <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filterOptions.sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              {Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : true)) && (
                <button
                  onClick={clearFilters}
                  className="text-red-500 hover:text-red-400 text-sm"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {filterOptions.types.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {filterOptions.statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium mb-2">Año</label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {filterOptions.years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium mb-2">Rating mínimo</label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Cualquiera</option>
                  <option value="9">9.0+</option>
                  <option value="8">8.0+</option>
                  <option value="7">7.0+</option>
                  <option value="6">6.0+</option>
                </select>
              </div>
            </div>

            {/* Genres */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Géneros</label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.genres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => handleGenreToggle(genre)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.genres.includes(genre)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {searchQuery ? `Resultados para "${searchQuery}"` : 'Todos los mangas'}
              <span className="text-gray-400 ml-2">({filteredMangas.length} resultados)</span>
            </h2>
          </div>
        </div>

        {/* Content Grid/List */}
        {filteredMangas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No se encontraron resultados</div>
            <div className="text-gray-500">Intenta ajustar los filtros o buscar otros términos</div>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredMangas.map(manga => (
                  <MangaGridItem key={manga.id} manga={manga} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMangas.map(manga => (
                  <MangaListItem key={manga.id} manga={manga} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                  >
                    Anterior
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (page > totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;