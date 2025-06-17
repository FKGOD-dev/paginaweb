import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  SlidersHorizontal,
  Star,
  Calendar,
  Eye,
  Heart,
  BookOpen,
  ChevronDown,
  X
} from 'lucide-react';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filtros
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    genres: [],
    year: '',
    rating: '',
    language: ''
  });

  // Datos de filtros disponibles
  const filterOptions = {
    types: [
      { value: 'manga', label: 'Manga' },
      { value: 'manhwa', label: 'Manhwa' },
      { value: 'manhua', label: 'Manhua' },
      { value: 'anime', label: 'Anime' }
    ],
    statuses: [
      { value: 'ongoing', label: 'En curso' },
      { value: 'completed', label: 'Completado' },
      { value: 'hiatus', label: 'En pausa' },
      { value: 'cancelled', label: 'Cancelado' }
    ],
    genres: [
      'Acción', 'Aventura', 'Comedia', 'Drama', 'Romance', 'Fantasía',
      'Sci-Fi', 'Horror', 'Misterio', 'Deportes', 'Slice of Life',
      'Shounen', 'Shoujo', 'Seinen', 'Josei', 'Ecchi', 'Harem'
    ],
    years: Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i),
    languages: [
      { value: 'es', label: 'Español' },
      { value: 'en', label: 'Inglés' },
      { value: 'jp', label: 'Japonés' },
      { value: 'kr', label: 'Coreano' },
      { value: 'cn', label: 'Chino' }
    ]
  };

  const sortOptions = [
    { value: 'popularity', label: 'Popularidad' },
    { value: 'rating', label: 'Calificación' },
    { value: 'latest', label: 'Más reciente' },
    { value: 'title', label: 'Título A-Z' },
    { value: 'year', label: 'Año' }
  ];

  // Debounce para búsqueda
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Función de búsqueda
  const performSearch = useCallback(
    debounce(async (query, page = 1) => {
      setLoading(true);
      try {
        // Simular API call
        const params = new URLSearchParams({
          search: query,
          page: page.toString(),
          limit: '20',
          sort: sortBy,
          ...(filters.type && { type: filters.type }),
          ...(filters.status && { status: filters.status }),
          ...(filters.year && { year: filters.year }),
          ...(filters.rating && { rating: filters.rating }),
          ...(filters.language && { language: filters.language })
        });

        if (filters.genres.length > 0) {
          filters.genres.forEach(genre => {
            params.append('genre', genre);
          });
        }

        // Mock data para demostración
        const mockResults = [
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
            synopsis: "Las aventuras de Monkey D. Luffy en busca del tesoro One Piece."
          },
          {
            id: 2,
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
            synopsis: "La humanidad lucha por sobrevivir contra los titanes."
          },
          {
            id: 3,
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
            synopsis: "Un cazador débil se convierte en el más poderoso."
          }
        ];

        // Filtrar resultados basado en búsqueda
        const filteredResults = mockResults.filter(item => 
          query === '' || 
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.author.toLowerCase().includes(query.toLowerCase())
        );

        setSearchResults(filteredResults);
        setTotalPages(Math.ceil(filteredResults.length / 20));
        setCurrentPage(page);

      } catch (error) {
        console.error('Error performing search:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [sortBy, filters]
  );

  // Efectos
  useEffect(() => {
    performSearch(searchQuery, 1);
  }, [searchQuery, sortBy, filters, performSearch]);

  // Manejadores
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1);
  };

  const handleGenreToggle = (genre) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      genres: [],
      year: '',
      rating: '',
      language: ''
    });
  };

  const MangaCard = ({ manga, isListView = false }) => {
    if (isListView) {
      return (
        <div className="flex bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
          <img
            src={manga.cover}
            alt={manga.title}
            className="w-16 h-24 object-cover rounded"
          />
          <div className="ml-4 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{manga.title}</h3>
                <p className="text-gray-400 text-sm mb-2">{manga.author}</p>
                <p className="text-gray-300 text-sm line-clamp-2">{manga.synopsis}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-yellow-500 mb-1">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  <span className="text-sm font-medium">{manga.rating}</span>
                </div>
                <div className="text-gray-400 text-xs">
                  {manga.chapters} caps
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {manga.genres.slice(0, 3).map((genre, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-600 text-xs rounded"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors group">
        <div className="relative">
          <img
            src={manga.cover}
            alt={manga.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-2 right-2">
            <div className="flex items-center bg-black/70 rounded px-2 py-1">
              <Star className="w-3 h-3 text-yellow-500 mr-1 fill-current" />
              <span className="text-xs text-white">{manga.rating}</span>
            </div>
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
              Ver detalles
            </button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-white font-semibold mb-1 line-clamp-1">{manga.title}</h3>
          <p className="text-gray-400 text-sm mb-2">{manga.author}</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {manga.genres.slice(0, 2).map((genre, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-600 text-xs rounded"
              >
                {genre}
              </span>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{manga.chapters} caps</span>
            <span>{manga.year}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header de búsqueda */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Buscar Manga/Anime</h1>
          
          {/* Barra de búsqueda */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar por título, autor o género..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Controles */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : true)) && (
                  <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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

        {/* Panel de filtros */}
        {showFilters && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filtros avanzados</h3>
              <button
                onClick={clearFilters}
                className="text-blue-500 hover:text-blue-400 text-sm"
              >
                Limpiar filtros
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {filterOptions.types.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {filterOptions.statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Año */}
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
            </div>

            {/* Géneros */}
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

        {/* Resultados */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {searchQuery ? `Resultados para "${searchQuery}"` : 'Explorar contenido'}
              {!loading && (
                <span className="text-gray-400 ml-2">
                  ({searchResults.length} resultados)
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Sin resultados */}
        {!loading && searchResults.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No se encontraron resultados</div>
            <div className="text-gray-500">Intenta con otros términos de búsqueda o ajusta los filtros</div>
          </div>
        )}

        {/* Grid/List de resultados */}
        {!loading && searchResults.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {searchResults.map(manga => (
                  <MangaCard key={manga.id} manga={manga} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map(manga => (
                  <MangaCard key={manga.id} manga={manga} isListView={true} />
                ))}
              </div>
            )}

            {/* Paginación */}
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

export default SearchPage;