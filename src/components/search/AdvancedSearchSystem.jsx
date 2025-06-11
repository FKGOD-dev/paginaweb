// src/components/search/AdvancedSearchSystem.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Calendar, 
  Play, 
  BookOpen, 
  User, 
  Eye,
  Heart,
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal,
  TrendingUp,
  Clock,
  Award,
  Loader
} from 'lucide-react';

// Mock data - en producción usarías el servicio real
const mockSearchService = {
  async searchContent(query, filters, type) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockResults = {
      anime: [
        {
          mal_id: 1,
          title: "Attack on Titan",
          title_english: "Attack on Titan",
          synopsis: "Humanity fights for survival against giant humanoid Titans behind three concentric walls.",
          images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg" } },
          score: 9.0,
          members: 3200000,
          genres: [{ name: "Action" }, { name: "Drama" }, { name: "Fantasy" }],
          status: "Finished Airing",
          type: "TV",
          episodes: 75,
          year: 2013,
          rating: "R - 17+ (violence & profanity)",
          studios: [{ name: "Mappa" }]
        },
        {
          mal_id: 2,
          title: "Demon Slayer",
          title_english: "Demon Slayer: Kimetsu no Yaiba",
          synopsis: "A young boy becomes a demon slayer to save his sister and avenge his family.",
          images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg" } },
          score: 8.7,
          members: 2100000,
          genres: [{ name: "Action" }, { name: "Supernatural" }, { name: "Historical" }],
          status: "Finished Airing",
          type: "TV",
          episodes: 44,
          year: 2019,
          rating: "R - 17+ (violence & profanity)",
          studios: [{ name: "Ufotable" }]
        }
      ],
      manga: [
        {
          mal_id: 3,
          title: "One Piece",
          title_english: "One Piece",
          synopsis: "Monkey D. Luffy sets off on his quest to become the Pirate King.",
          images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/manga/2/253146l.jpg" } },
          score: 9.2,
          members: 1800000,
          genres: [{ name: "Action" }, { name: "Adventure" }, { name: "Comedy" }],
          status: "Publishing",
          type: "Manga",
          chapters: 1000,
          volumes: 100,
          authors: [{ name: "Oda, Eiichiro" }]
        }
      ],
      characters: [
        {
          mal_id: 4,
          name: "Eren Yeager",
          name_kanji: "エレン・イェーガー",
          images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/10/216895.jpg" } },
          about: "Main protagonist of Attack on Titan",
          favorites: 85000,
          animeography: [{ name: "Attack on Titan" }]
        }
      ]
    };

    return {
      data: mockResults[type] || [],
      pagination: {
        current_page: 1,
        last_visible_page: 5,
        has_next_page: true,
        items: { count: 25, total: 1000, per_page: 25 }
      }
    };
  },

  async getGenres(type) {
    const genres = {
      anime: [
        { mal_id: 1, name: "Action" },
        { mal_id: 2, name: "Adventure" },
        { mal_id: 4, name: "Comedy" },
        { mal_id: 8, name: "Drama" },
        { mal_id: 10, name: "Fantasy" },
        { mal_id: 14, name: "Horror" },
        { mal_id: 22, name: "Romance" },
        { mal_id: 24, name: "Sci-Fi" },
        { mal_id: 36, name: "Slice of Life" },
        { mal_id: 37, name: "Supernatural" }
      ],
      manga: [
        { mal_id: 1, name: "Action" },
        { mal_id: 2, name: "Adventure" },
        { mal_id: 4, name: "Comedy" },
        { mal_id: 8, name: "Drama" },
        { mal_id: 10, name: "Fantasy" },
        { mal_id: 13, name: "Historical" },
        { mal_id: 22, name: "Romance" },
        { mal_id: 24, name: "Sci-Fi" },
        { mal_id: 36, name: "Slice of Life" }
      ]
    };
    return { data: genres[type] || [] };
  }
};

const AdvancedSearchSystem = () => {
  const [searchType, setSearchType] = useState('anime');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [filters, setFilters] = useState({
    genres: [],
    type: '',
    status: '',
    rating: '',
    score: { min: '', max: '' },
    year: { min: '', max: '' },
    episodes: { min: '', max: '' },
    orderBy: 'score',
    sort: 'desc',
    page: 1
  });

  const searchTypes = [
    { id: 'anime', label: 'Anime', icon: Play },
    { id: 'manga', label: 'Manga', icon: BookOpen },
    { id: 'characters', label: 'Personajes', icon: User }
  ];

  const animeTypes = ['TV', 'OVA', 'Movie', 'Special', 'ONA', 'Music'];
  const mangaTypes = ['Manga', 'Light Novel', 'One-shot', 'Doujinshi', 'Manhwa', 'Manhua'];
  const statusOptions = {
    anime: ['Finished Airing', 'Currently Airing', 'Not yet aired'],
    manga: ['Finished', 'Publishing', 'On Hiatus', 'Discontinued', 'Not yet published']
  };

  const sortOptions = [
    { value: 'score', label: 'Puntuación' },
    { value: 'ranked', label: 'Ranking' },
    { value: 'popularity', label: 'Popularidad' },
    { value: 'members', label: 'Miembros' },
    { value: 'favorites', label: 'Favoritos' },
    { value: 'title', label: 'Título' },
    { value: 'start_date', label: 'Fecha de inicio' },
    { value: 'end_date', label: 'Fecha de fin' }
  ];

  useEffect(() => {
    loadGenres();
  }, [searchType]);

  const loadGenres = async () => {
    try {
      const response = await mockSearchService.getGenres(searchType);
      setAvailableGenres(response.data);
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const handleSearch = useCallback(async () => {
    if (!query.trim() && Object.values(filters).every(v => 
      Array.isArray(v) ? v.length === 0 : !v || (typeof v === 'object' && !v.min && !v.max)
    )) {
      return;
    }

    setLoading(true);
    try {
      const response = await mockSearchService.searchContent(query, filters, searchType);
      setResults(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, filters, searchType]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [handleSearch]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleGenreToggle = (genreId) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter(id => id !== genreId)
        : [...prev.genres, genreId],
      page: 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      genres: [],
      type: '',
      status: '',
      rating: '',
      score: { min: '', max: '' },
      year: { min: '', max: '' },
      episodes: { min: '', max: '' },
      orderBy: 'score',
      sort: 'desc',
      page: 1
    });
  };

  const formatScore = (score) => score ? score.toFixed(1) : 'N/A';
  const formatMembers = (members) => {
    if (members >= 1000000) {
      return `${(members / 1000000).toFixed(1)}M`;
    } else if (members >= 1000) {
      return `${(members / 1000).toFixed(1)}K`;
    }
    return members?.toString() || '0';
  };

  const renderFilters = () => (
    <div className={`bg-gray-800 rounded-xl p-6 transition-all duration-300 ${showFilters ? 'block' : 'hidden'}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Filtros Avanzados</h3>
        <button
          onClick={clearFilters}
          className="text-red-400 hover:text-red-300 text-sm transition-colors"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {(searchType === 'anime' ? animeTypes : mangaTypes).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {statusOptions[searchType]?.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Score Range */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Puntuación</label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.score.min}
              onChange={(e) => handleFilterChange('score', { ...filters.score, min: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="10"
              step="0.1"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.score.max}
              onChange={(e) => handleFilterChange('score', { ...filters.score, max: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="10"
              step="0.1"
            />
          </div>
        </div>

        {/* Year Range */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Año</label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Desde"
              value={filters.year.min}
              onChange={(e) => handleFilterChange('year', { ...filters.year, min: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1960"
              max="2030"
            />
            <input
              type="number"
              placeholder="Hasta"
              value={filters.year.max}
              onChange={(e) => handleFilterChange('year', { ...filters.year, max: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1960"
              max="2030"
            />
          </div>
        </div>
      </div>

      {/* Genres */}
      {availableGenres.length > 0 && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">Géneros</label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {availableGenres.map(genre => (
              <button
                key={genre.mal_id}
                onClick={() => handleGenreToggle(genre.mal_id)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.genres.includes(genre.mal_id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Ordenar por</label>
          <select
            value={filters.orderBy}
            onChange={(e) => handleFilterChange('orderBy', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Orden</label>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Buscando...</p>
          </div>
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No se encontraron resultados</h3>
          <p className="text-gray-400">Intenta ajustar tu búsqueda o filtros</p>
        </div>
      );
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {results.map(item => (
            <div key={item.mal_id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src={item.images?.jpg?.large_image_url || item.images?.jpg?.image_url}
                  alt={item.title || item.name}
                  className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4">
                    {item.score && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="text-yellow-400 fill-current" size={16} />
                        <span className="text-white font-semibold">{formatScore(item.score)}</span>
                      </div>
                    )}
                    {item.members && (
                      <div className="flex items-center space-x-2">
                        <Eye className="text-blue-400" size={16} />
                        <span className="text-gray-300 text-sm">{formatMembers(item.members)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <h3 className="text-white font-semibold mt-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
                {item.title || item.name}
              </h3>
              {item.year && (
                <p className="text-gray-400 text-sm">{item.year}</p>
              )}
            </div>
          ))}
        </div>
      );
    }

    // List view
    return (
      <div className="space-y-4">
        {results.map(item => (
          <div key={item.mal_id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors cursor-pointer">
            <div className="flex space-x-4">
              <img 
                src={item.images?.jpg?.large_image_url || item.images?.jpg?.image_url}
                alt={item.title || item.name}
                className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2 hover:text-blue-400 transition-colors">
                      {item.title || item.name}
                    </h3>
                    <p className="text-gray-300 text-sm line-clamp-3 mb-3">
                      {item.synopsis || item.about}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.genres?.slice(0, 3).map(genre => (
                        <span key={genre.name} className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    {item.score && (
                      <div className="flex items-center space-x-1 mb-2">
                        <Star className="text-yellow-400 fill-current" size={16} />
                        <span className="text-white font-semibold">{formatScore(item.score)}</span>
                      </div>
                    )}
                    {item.members && (
                      <div className="flex items-center space-x-1 mb-2">
                        <Eye className="text-blue-400" size={16} />
                        <span className="text-gray-300 text-sm">{formatMembers(item.members)}</span>
                      </div>
                    )}
                    {item.year && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="text-purple-400" size={16} />
                        <span className="text-gray-300 text-sm">{item.year}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Búsqueda Avanzada</h1>
          <p className="text-gray-400">Encuentra exactamente lo que estás buscando</p>
        </div>

        {/* Search Type Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg w-fit">
          {searchTypes.map(type => (
            <button
              key={type.id}
              onClick={() => {
                setSearchType(type.id);
                setResults([]);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                searchType === type.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <type.icon size={20} />
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Buscar ${searchType}...`}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <SlidersHorizontal size={20} />
              <span>Filtros</span>
              {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {renderFilters()}

        {/* Results */}
        <div className="mt-6">
          {pagination && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400">
                Mostrando {pagination.items.count} de {pagination.items.total} resultados
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Página {pagination.current_page} de {pagination.last_visible_page}</span>
              </div>
            </div>
          )}
          
          {renderResults()}

          {/* Pagination */}
          {pagination && pagination.has_next_page && (
            <div className="flex justify-center mt-8">
              <button 
                onClick={() => handleFilterChange('page', filters.page + 1)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                disabled={loading}
              >
                Cargar más resultados
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchSystem;