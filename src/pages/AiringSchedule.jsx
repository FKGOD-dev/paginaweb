// pages/AiringSchedule.jsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Clock,
  Play,
  Star,
  Bell,
  BellRing,
  Eye,
  Users,
  TrendingUp,
  Filter,
  Search,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Heart,
  Share2,
  Info,
  MapPin,
  Tv,
  Radio,
  Wifi,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';

// Datos de plataformas de streaming
const STREAMING_PLATFORMS = {
  crunchyroll: { name: 'Crunchyroll', color: 'bg-orange-500', icon: '🍱' },
  funimation: { name: 'Funimation', color: 'bg-purple-600', icon: '🎭' },
  netflix: { name: 'Netflix', color: 'bg-red-600', icon: 'N' },
  hulu: { name: 'Hulu', color: 'bg-green-500', icon: 'H' },
  amazon: { name: 'Amazon Prime', color: 'bg-blue-600', icon: '📦' },
  disney: { name: 'Disney+', color: 'bg-blue-800', icon: '🏰' },
  hbo: { name: 'HBO Max', color: 'bg-purple-700', icon: 'H' },
  other: { name: 'Otros', color: 'bg-gray-500', icon: '📺' }
};

// Días de la semana en japonés/español
const WEEKDAYS = [
  { en: 'monday', jp: '月', es: 'Lunes' },
  { en: 'tuesday', jp: '火', es: 'Martes' },
  { en: 'wednesday', jp: '水', es: 'Miércoles' },
  { en: 'thursday', jp: '木', es: 'Jueves' },
  { en: 'friday', jp: '金', es: 'Viernes' },
  { en: 'saturday', jp: '土', es: 'Sábado' },
  { en: 'sunday', jp: '日', es: 'Domingo' }
];

// Hook para manejar los datos de airing
const useAiringSchedule = () => {
  const [currentSeason, setCurrentSeason] = useState('winter-2025');
  const [airingAnime, setAiringAnime] = useState([]);
  const [upcomingAnime, setUpcomingAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followedAnime, setFollowedAnime] = useState(new Set());

  // Generar datos mock
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Anime en emisión actual
      const mockAiring = [
        {
          id: 1,
          title: 'Jujutsu Kaisen Season 3',
          titleJP: '呪術廻戦 第3期',
          image: 'https://picsum.photos/300/400?random=1',
          studio: 'MAPPA',
          episodeCount: 24,
          currentEpisode: 8,
          rating: 9.1,
          popularity: 95,
          airingTime: new Date(2025, 0, 12, 23, 0), // Domingo 23:00
          airingDay: 'sunday',
          status: 'airing',
          genres: ['Action', 'Supernatural', 'School'],
          platforms: ['crunchyroll', 'funimation'],
          synopsis: 'La tercera temporada continúa las aventuras de Yuji Itadori mientras enfrenta nuevas amenazas sobrenaturales.',
          nextEpisode: new Date(2025, 0, 19, 23, 0),
          followers: 234567,
          source: 'Manga',
          year: 2025,
          season: 'winter'
        },
        {
          id: 2,
          title: 'Solo Leveling Season 2',
          titleJP: '俺だけレベルアップな件 第2期',
          image: 'https://picsum.photos/300/400?random=2',
          studio: 'A-1 Pictures',
          episodeCount: 12,
          currentEpisode: 3,
          rating: 8.9,
          popularity: 88,
          airingTime: new Date(2025, 0, 11, 22, 30), // Sábado 22:30
          airingDay: 'saturday',
          status: 'airing',
          genres: ['Action', 'Fantasy', 'Game'],
          platforms: ['crunchyroll'],
          synopsis: 'Sung Jinwoo continúa su ascensión como el cazador más poderoso del mundo.',
          nextEpisode: new Date(2025, 0, 18, 22, 30),
          followers: 189423,
          source: 'Manhwa',
          year: 2025,
          season: 'winter'
        },
        {
          id: 3,
          title: 'Demon Slayer: Infinity Castle Arc',
          titleJP: '鬼滅の刃 無限城編',
          image: 'https://picsum.photos/300/400?random=3',
          studio: 'Ufotable',
          episodeCount: 11,
          currentEpisode: 11,
          rating: 9.4,
          popularity: 98,
          airingTime: new Date(2025, 0, 9, 23, 15), // Jueves 23:15
          airingDay: 'thursday',
          status: 'finished',
          genres: ['Action', 'Historical', 'Demons'],
          platforms: ['crunchyroll', 'funimation', 'netflix'],
          synopsis: 'La batalla final en el Castillo Infinito llega a su dramática conclusión.',
          nextEpisode: null,
          followers: 456789,
          source: 'Manga',
          year: 2024,
          season: 'fall'
        },
        {
          id: 4,
          title: 'My Hero Academia Season 8',
          titleJP: '僕のヒーローアカデミア 第8期',
          image: 'https://picsum.photos/300/400?random=4',
          studio: 'Bones',
          episodeCount: 25,
          currentEpisode: 5,
          rating: 8.7,
          popularity: 82,
          airingTime: new Date(2025, 0, 11, 17, 30), // Sábado 17:30
          airingDay: 'saturday',
          status: 'airing',
          genres: ['Action', 'School', 'Super Power'],
          platforms: ['crunchyroll', 'funimation', 'hulu'],
          synopsis: 'Deku y sus compañeros enfrentan la amenaza final de All For One.',
          nextEpisode: new Date(2025, 0, 18, 17, 30),
          followers: 123456,
          source: 'Manga',
          year: 2025,
          season: 'winter'
        },
        {
          id: 5,
          title: 'Chainsaw Man Season 2',
          titleJP: 'チェンソーマン 第2期',
          image: 'https://picsum.photos/300/400?random=5',
          studio: 'MAPPA',
          episodeCount: 12,
          currentEpisode: 2,
          rating: 8.8,
          popularity: 91,
          airingTime: new Date(2025, 0, 15, 24, 0), // Miércoles 00:00
          airingDay: 'wednesday',
          status: 'airing',
          genres: ['Action', 'Supernatural', 'Gore'],
          platforms: ['crunchyroll'],
          synopsis: 'Denji regresa con más caos y demonios en esta segunda temporada.',
          nextEpisode: new Date(2025, 0, 22, 24, 0),
          followers: 198765,
          source: 'Manga',
          year: 2025,
          season: 'winter'
        }
      ];

      // Anime próximo a estrenarse
      const mockUpcoming = [
        {
          id: 6,
          title: 'Attack on Titan: The Last Attack',
          titleJP: '進撃の巨人 最後の進撃',
          image: 'https://picsum.photos/300/400?random=6',
          studio: 'Wit Studio x MAPPA',
          episodeCount: 6,
          rating: 0,
          popularity: 99,
          releaseDate: new Date(2025, 3, 15), // Abril 2025
          status: 'upcoming',
          genres: ['Action', 'Drama', 'Military'],
          platforms: ['crunchyroll', 'funimation', 'netflix', 'hulu'],
          synopsis: 'La conclusión definitiva de la épica historia de Eren Yeager y la humanidad.',
          followers: 567890,
          source: 'Manga',
          year: 2025,
          season: 'spring',
          isHighlyAnticipated: true
        },
        {
          id: 7,
          title: 'One Piece: Elbaf Arc',
          titleJP: 'ワンピース エルバフ編',
          image: 'https://picsum.photos/300/400?random=7',
          studio: 'Toei Animation',
          episodeCount: '?',
          rating: 0,
          popularity: 96,
          releaseDate: new Date(2025, 5, 1), // Junio 2025
          status: 'upcoming',
          genres: ['Adventure', 'Comedy', 'Shounen'],
          platforms: ['crunchyroll', 'funimation'],
          synopsis: 'Los Sombreros de Paja finalmente llegan a Elbaf, la isla de los gigantes.',
          followers: 432109,
          source: 'Manga',
          year: 2025,
          season: 'summer'
        },
        {
          id: 8,
          title: 'Mob Psycho 100 IV',
          titleJP: 'モブサイコ100 IV',
          image: 'https://picsum.photos/300/400?random=8',
          studio: 'Bones',
          episodeCount: 12,
          rating: 0,
          popularity: 87,
          releaseDate: new Date(2025, 6, 10), // Julio 2025
          status: 'upcoming',
          genres: ['Supernatural', 'Comedy', 'School'],
          platforms: ['crunchyroll'],
          synopsis: 'Mob regresa para una nueva aventura psíquica llena de emociones.',
          followers: 178934,
          source: 'Manga',
          year: 2025,
          season: 'summer'
        }
      ];

      setAiringAnime(mockAiring);
      setUpcomingAnime(mockUpcoming);
      setLoading(false);
    };

    loadData();
  }, [currentSeason]);

  const toggleFollow = (animeId) => {
    setFollowedAnime(prev => {
      const newSet = new Set(prev);
      if (newSet.has(animeId)) {
        newSet.delete(animeId);
      } else {
        newSet.add(animeId);
      }
      return newSet;
    });
  };

  return {
    currentSeason,
    setCurrentSeason,
    airingAnime,
    upcomingAnime,
    loading,
    followedAnime,
    toggleFollow
  };
};

const AiringSchedule = () => {
  const [activeTab, setActiveTab] = useState('current-season');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'calendar'
  const [filterGenre, setFilterGenre] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularity');

  const {
    currentSeason,
    setCurrentSeason,
    airingAnime,
    upcomingAnime,
    loading,
    followedAnime,
    toggleFollow
  } = useAiringSchedule();

  // Obtener todos los géneros únicos
  const allGenres = React.useMemo(() => {
    const genres = new Set();
    [...airingAnime, ...upcomingAnime].forEach(anime => {
      anime.genres.forEach(genre => genres.add(genre));
    });
    return Array.from(genres);
  }, [airingAnime, upcomingAnime]);

  // Filtrar y ordenar anime
  const getFilteredAnime = (animeList) => {
    let filtered = animeList.filter(anime => {
      const matchesSearch = anime.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           anime.titleJP.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = filterGenre === 'all' || anime.genres.includes(filterGenre);
      const matchesPlatform = filterPlatform === 'all' || anime.platforms.includes(filterPlatform);
      
      return matchesSearch && matchesGenre && matchesPlatform;
    });

    switch (sortBy) {
      case 'popularity':
        return filtered.sort((a, b) => b.popularity - a.popularity);
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating);
      case 'title':
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case 'episode':
        return filtered.sort((a, b) => (b.currentEpisode || 0) - (a.currentEpisode || 0));
      case 'followers':
        return filtered.sort((a, b) => b.followers - a.followers);
      default:
        return filtered;
    }
  };

  // Agrupar anime por día de la semana para vista calendario
  const getAnimeByDay = () => {
    const byDay = {};
    WEEKDAYS.forEach(day => {
      byDay[day.en] = airingAnime.filter(anime => anime.airingDay === day.en && anime.status === 'airing');
    });
    return byDay;
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTimeUntilNext = (nextEpisode) => {
    if (!nextEpisode) return null;
    
    const now = new Date();
    const diff = nextEpisode - now;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Próximamente';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md animate-pulse">
                <div className="h-64 bg-gray-300 dark:bg-gray-600"></div>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            Calendario de Anime
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Mantente al día con los últimos episodios y próximos estrenos
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <TabsList className="grid w-full lg:w-auto grid-cols-3">
              <TabsTrigger value="current-season" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Temporada Actual
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Próximos Estrenos
              </TabsTrigger>
              <TabsTrigger value="following" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Siguiendo
              </TabsTrigger>
            </TabsList>

            {/* Controls */}
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 lg:flex-none">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar anime..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white w-full lg:w-64"
                />
              </div>

              {/* Filters */}
              <select
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              >
                <option value="all">Todos los géneros</option>
                {allGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>

              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              >
                <option value="all">Todas las plataformas</option>
                {Object.entries(STREAMING_PLATFORMS).map(([key, platform]) => (
                  <option key={key} value={key}>{platform.name}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              >
                <option value="popularity">Popularidad</option>
                <option value="rating">Puntuación</option>
                <option value="title">Título</option>
                <option value="episode">Episodio</option>
                <option value="followers">Seguidores</option>
              </select>

              {/* View Mode Toggle */}
              {activeTab === 'current-season' && (
                <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`p-2 transition-colors ${
                      viewMode === 'calendar'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Current Season Content */}
          <TabsContent value="current-season">
            {viewMode === 'grid' ? (
              <AnimeGrid 
                animeList={getFilteredAnime(airingAnime)} 
                followedAnime={followedAnime}
                onToggleFollow={toggleFollow}
                showAiringInfo={true}
              />
            ) : (
              <CalendarView 
                animeByDay={getAnimeByDay()}
                followedAnime={followedAnime}
                onToggleFollow={toggleFollow}
              />
            )}
          </TabsContent>

          {/* Upcoming Content */}
          <TabsContent value="upcoming">
            <AnimeGrid 
              animeList={getFilteredAnime(upcomingAnime)} 
              followedAnime={followedAnime}
              onToggleFollow={toggleFollow}
              showAiringInfo={false}
            />
          </TabsContent>

          {/* Following Content */}
          <TabsContent value="following">
            <AnimeGrid 
              animeList={[...airingAnime, ...upcomingAnime].filter(anime => followedAnime.has(anime.id))} 
              followedAnime={followedAnime}
              onToggleFollow={toggleFollow}
              showAiringInfo={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Componente Grid de Anime
const AnimeGrid = ({ animeList, followedAnime, onToggleFollow, showAiringInfo }) => {
  if (animeList.length === 0) {
    return (
      <div className="text-center py-16">
        <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No se encontraron resultados
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Prueba ajustando los filtros de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {animeList.map(anime => (
        <AnimeCard
          key={anime.id}
          anime={anime}
          isFollowed={followedAnime.has(anime.id)}
          onToggleFollow={onToggleFollow}
          showAiringInfo={showAiringInfo}
        />
      ))}
    </div>
  );
};

// Componente Card de Anime
const AnimeCard = ({ anime, isFollowed, onToggleFollow, showAiringInfo }) => {
  const getTimeUntilNext = (nextEpisode) => {
    if (!nextEpisode) return null;
    
    const now = new Date();
    const diff = nextEpisode - now;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Próximamente';
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
      {/* Image and overlay */}
      <div className="relative overflow-hidden">
        <img
          src={anime.image}
          alt={anime.title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Status badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {anime.status === 'airing' && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Radio className="w-3 h-3" />
              En emisión
            </span>
          )}
          {anime.status === 'upcoming' && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Próximamente
            </span>
          )}
          {anime.status === 'finished' && (
            <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Finalizado
            </span>
          )}
          {anime.isHighlyAnticipated && (
            <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Star className="w-3 h-3" />
              Muy esperado
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFollow(anime.id);
            }}
            className={`p-2 rounded-full transition-colors ${
              isFollowed
                ? 'bg-blue-600 text-white'
                : 'bg-black/50 hover:bg-black/70 text-white'
            }`}
          >
            {isFollowed ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </button>
          <button className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors">
            <Heart className="w-4 h-4" />
          </button>
          <button className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Episode progress */}
        {anime.currentEpisode && anime.episodeCount && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-black/70 backdrop-blur-sm rounded px-2 py-1">
              <div className="flex justify-between text-white text-xs mb-1">
                <span>Episodio {anime.currentEpisode}</span>
                <span>{anime.episodeCount !== '?' ? `/${anime.episodeCount}` : ''}</span>
              </div>
              {anime.episodeCount !== '?' && (
                <div className="w-full bg-gray-600 rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${(anime.currentEpisode / anime.episodeCount) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {anime.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
          {anime.titleJP}
        </p>

        {/* Studio and source */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span>{anime.studio}</span>
          <span>{anime.source}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-3">
          {anime.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">{anime.rating}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{(anime.followers / 1000).toFixed(0)}K</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm">{anime.popularity}%</span>
          </div>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1 mb-3">
          {anime.genres.slice(0, 3).map((genre, index) => (
            <span
              key={index}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs"
            >
              {genre}
            </span>
          ))}
          {anime.genres.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
              +{anime.genres.length - 3}
            </span>
          )}
        </div>

        {/* Airing info */}
        {showAiringInfo && anime.nextEpisode && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Próximo episodio:</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {getTimeUntilNext(anime.nextEpisode)}
              </span>
            </div>
          </div>
        )}

        {/* Release date for upcoming */}
        {anime.status === 'upcoming' && anime.releaseDate && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Estreno:</span>
              <span className="font-medium text-purple-600 dark:text-purple-400">
                {formatDate(anime.releaseDate)}
              </span>
            </div>
          </div>
        )}

        {/* Platforms */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">Disponible en:</span>
          <div className="flex gap-1">
            {anime.platforms.slice(0, 4).map(platform => {
              const platformInfo = STREAMING_PLATFORMS[platform];
              return (
                <div
                  key={platform}
                  className={`w-6 h-6 ${platformInfo.color} rounded text-white text-xs flex items-center justify-center font-bold`}
                  title={platformInfo.name}
                >
                  {platformInfo.icon}
                </div>
              );
            })}
            {anime.platforms.length > 4 && (
              <div className="w-6 h-6 bg-gray-400 rounded text-white text-xs flex items-center justify-center">
                +{anime.platforms.length - 4}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Vista Calendario
const CalendarView = ({ animeByDay, followedAnime, onToggleFollow }) => {
  const formatTime = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
      {WEEKDAYS.map(day => (
        <div key={day.en} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
          {/* Day header */}
          <div className="bg-blue-600 text-white p-4 text-center">
            <div className="text-2xl font-bold mb-1">{day.jp}</div>
            <div className="text-sm">{day.es}</div>
          </div>

          {/* Anime list for this day */}
          <div className="p-2 space-y-2 min-h-[400px]">
            {animeByDay[day.en]?.length > 0 ? (
              animeByDay[day.en].map(anime => (
                <div
                  key={anime.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={anime.image}
                      alt={anime.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                        {anime.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Ep. {anime.currentEpisode} • {formatTime(anime.airingTime)}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs">{anime.rating}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFollow(anime.id);
                          }}
                          className={`p-1 rounded transition-colors ${
                            followedAnime.has(anime.id)
                              ? 'text-blue-600'
                              : 'text-gray-400 hover:text-blue-600'
                          }`}
                        >
                          {followedAnime.has(anime.id) ? (
                            <BellRing className="w-3 h-3" />
                          ) : (
                            <Bell className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No hay estrenos este día
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AiringSchedule;