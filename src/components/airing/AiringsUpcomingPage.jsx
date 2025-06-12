// src/components/airings/AiringsUpcomingPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Star, 
  Users, 
  Play, 
  BookOpen, 
  TrendingUp, 
  Filter, 
  Search,
  ChevronDown,
  ChevronUp,
  Bell,
  BellOff,
  Eye,
  Heart,
  Share2,
  ExternalLink,
  Tv,
  Monitor,
  Smartphone,
  Youtube,
  Twitch,
  Globe,
  MapPin,
  Award,
  Zap,
  Info,
  Plus,
  Bookmark,
  AlertCircle,
  CheckCircle,
  Timer,
  RefreshCw
} from 'lucide-react';

const AiringsUpcomingPage = () => {
  const [activeTab, setActiveTab] = useState('current'); // current, upcoming, recent
  const [selectedSeason, setSelectedSeason] = useState('winter-2024');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, calendar
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(new Set());
  const [filters, setFilters] = useState({
    genre: '',
    studio: '',
    type: '', // TV, OVA, Movie, etc.
    rating: '',
    platform: '' // Crunchyroll, Netflix, etc.
  });

  // Mock data para anime airing y upcoming
  const mockCurrentSeason = [
    {
      mal_id: 1,
      title: "Frieren: Beyond Journey's End",
      title_japanese: "葬送のフリーレン",
      synopsis: "After the party of heroes defeated the Demon King, they all went their separate ways...",
      images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg" } },
      score: 9.2,
      members: 450000,
      genres: [{ name: "Adventure" }, { name: "Drama" }, { name: "Fantasy" }],
      studios: [{ name: "Madhouse" }],
      status: "Currently Airing",
      episodes: 28,
      currentEpisode: 15,
      airingInfo: {
        nextEpisode: 16,
        airingAt: "2024-01-19T15:30:00Z",
        dayOfWeek: "Friday",
        timeJST: "00:30"
      },
      platforms: ["Crunchyroll", "Netflix"],
      season: "fall",
      year: 2023,
      rating: "PG-13",
      popularity: 12,
      rank: 3
    },
    {
      mal_id: 2,
      title: "Dungeon Meshi",
      title_japanese: "ダンジョン飯",
      synopsis: "When young adventurer Laios and his company are attacked and soundly thrashed by a dragon...",
      images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1223/132694l.jpg" } },
      score: 8.8,
      members: 280000,
      genres: [{ name: "Adventure" }, { name: "Comedy" }, { name: "Fantasy" }],
      studios: [{ name: "Studio Trigger" }],
      status: "Currently Airing",
      episodes: 24,
      currentEpisode: 8,
      airingInfo: {
        nextEpisode: 9,
        airingAt: "2024-01-18T16:00:00Z",
        dayOfWeek: "Thursday",
        timeJST: "01:00"
      },
      platforms: ["Netflix"],
      season: "winter",
      year: 2024,
      rating: "PG-13",
      popularity: 45,
      rank: 15
    },
    {
      mal_id: 3,
      title: "Solo Leveling",
      title_japanese: "俺だけレベルアップな件",
      synopsis: "Ten years ago, 'the Gate' appeared and connected the real world with the realm of magic and monsters...",
      images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1644/140991l.jpg" } },
      score: 8.5,
      members: 890000,
      genres: [{ name: "Action" }, { name: "Adventure" }, { name: "Fantasy" }],
      studios: [{ name: "A-1 Pictures" }],
      status: "Currently Airing",
      episodes: 12,
      currentEpisode: 3,
      airingInfo: {
        nextEpisode: 4,
        airingAt: "2024-01-20T15:00:00Z",
        dayOfWeek: "Saturday",
        timeJST: "00:00"
      },
      platforms: ["Crunchyroll", "Funimation"],
      season: "winter",
      year: 2024,
      rating: "R - 17+",
      popularity: 8,
      rank: 28
    }
  ];

  const mockUpcoming = [
    {
      mal_id: 4,
      title: "Demon Slayer: Infinity Castle Arc",
      title_japanese: "鬼滅の刃 無限城編",
      synopsis: "The highly anticipated continuation of the Demon Slayer saga...",
      images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg" } },
      score: null,
      members: 1200000,
      genres: [{ name: "Action" }, { name: "Supernatural" }, { name: "Historical" }],
      studios: [{ name: "Ufotable" }],
      status: "Not yet aired",
      episodes: null,
      releaseInfo: {
        estimatedDate: "2024-04-01T00:00:00Z",
        season: "spring",
        year: 2024,
        confirmed: false
      },
      platforms: ["Crunchyroll", "Funimation"],
      rating: "R - 17+",
      popularity: 1,
      hype: 98
    },
    {
      mal_id: 5,
      title: "Jujutsu Kaisen Season 3",
      title_japanese: "呪術廻戦 第3期",
      synopsis: "The third season of the popular supernatural anime continues...",
      images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg" } },
      score: null,
      members: 980000,
      genres: [{ name: "Action" }, { name: "Supernatural" }, { name: "School" }],
      studios: [{ name: "Mappa" }],
      status: "Not yet aired",
      episodes: 24,
      releaseInfo: {
        estimatedDate: "2024-07-01T00:00:00Z",
        season: "summer",
        year: 2024,
        confirmed: true
      },
      platforms: ["Crunchyroll"],
      rating: "R - 17+",
      popularity: 2,
      hype: 95
    }
  ];

  const mockRecentlyFinished = [
    {
      mal_id: 6,
      title: "Spy x Family Season 2",
      title_japanese: "スパイファミリー 第2期",
      synopsis: "The Forger family continues their chaotic but heartwarming adventures...",
      images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1111/127508l.jpg" } },
      score: 8.3,
      members: 750000,
      genres: [{ name: "Action" }, { name: "Comedy" }, { name: "Family" }],
      studios: [{ name: "Wit Studio" }, { name: "CloverWorks" }],
      status: "Finished Airing",
      episodes: 12,
      finishedDate: "2023-12-23T00:00:00Z",
      platforms: ["Crunchyroll", "Hulu"],
      season: "fall",
      year: 2023,
      rating: "PG-13",
      popularity: 15,
      rank: 45
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const seasons = [
    { value: 'winter-2024', label: 'Invierno 2024' },
    { value: 'spring-2024', label: 'Primavera 2024' },
    { value: 'summer-2024', label: 'Verano 2024' },
    { value: 'fall-2024', label: 'Otoño 2024' },
    { value: 'winter-2025', label: 'Invierno 2025' }
  ];

  const platforms = [
    { name: 'Crunchyroll', color: 'bg-orange-500', icon: Tv },
    { name: 'Netflix', color: 'bg-red-600', icon: Monitor },
    { name: 'Funimation', color: 'bg-purple-600', icon: Play },
    { name: 'Hulu', color: 'bg-green-500', icon: Smartphone }
  ];

  const getTimeUntilAiring = (airingTime) => {
    const now = currentTime;
    const airTime = new Date(airingTime);
    const diff = airTime - now;

    if (diff <= 0) return 'Disponible ahora';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const toggleNotification = (animeId) => {
    const newNotifications = new Set(notifications);
    if (notifications.has(animeId)) {
      newNotifications.delete(animeId);
    } else {
      newNotifications.add(animeId);
    }
    setNotifications(newNotifications);
  };

  const getPlatformIcon = (platformName) => {
    const platform = platforms.find(p => p.name === platformName);
    return platform ? platform.icon : Globe;
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

  const renderAnimeCard = (anime, isUpcoming = false) => (
    <div key={anime.mal_id} className="bg-gray-800 rounded-xl overflow-hidden group hover:bg-gray-750 transition-all duration-300 cursor-pointer">
      <div className="relative">
        <img 
          src={anime.images.jpg.large_image_url}
          alt={anime.title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {isUpcoming ? (
            <span className="px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
              Próximamente
            </span>
          ) : anime.status === 'Currently Airing' ? (
            <span className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-full flex items-center space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>En Emisión</span>
            </span>
          ) : (
            <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
              Finalizado
            </span>
          )}
        </div>

        {/* Notification Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleNotification(anime.mal_id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            notifications.has(anime.mal_id)
              ? 'bg-blue-600 text-white'
              : 'bg-black/50 text-white hover:bg-black/70'
          }`}
        >
          {notifications.has(anime.mal_id) ? <Bell size={16} /> : <BellOff size={16} />}
        </button>

        {/* Platforms */}
        <div className="absolute bottom-3 left-3 flex space-x-2">
          {anime.platforms?.slice(0, 3).map((platform, index) => {
            const IconComponent = getPlatformIcon(platform);
            const platformInfo = platforms.find(p => p.name === platform);
            return (
              <div 
                key={index}
                className={`p-1.5 rounded ${platformInfo?.color || 'bg-gray-600'} text-white`}
                title={platform}
              >
                <IconComponent size={14} />
              </div>
            );
          })}
          {anime.platforms?.length > 3 && (
            <div className="px-2 py-1 bg-gray-600 text-white text-xs rounded">
              +{anime.platforms.length - 3}
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {anime.title}
        </h3>

        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
          {anime.synopsis}
        </p>

        {/* Genres */}
        <div className="flex flex-wrap gap-1 mb-3">
          {anime.genres?.slice(0, 3).map(genre => (
            <span key={genre.name} className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
              {genre.name}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4 text-sm">
            {anime.score && (
              <div className="flex items-center space-x-1">
                <Star className="text-yellow-400 fill-current" size={14} />
                <span className="text-white">{formatScore(anime.score)}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Users className="text-blue-400" size={14} />
              <span className="text-gray-300">{formatMembers(anime.members)}</span>
            </div>
            {anime.studios?.[0] && (
              <div className="flex items-center space-x-1">
                <Award className="text-purple-400" size={14} />
                <span className="text-gray-300 text-xs">{anime.studios[0].name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Airing Info */}
        {isUpcoming ? (
          <div className="bg-purple-600/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">
                  {anime.releaseInfo?.season} {anime.releaseInfo?.year}
                </p>
                <p className="text-gray-300 text-xs">
                  {anime.releaseInfo?.confirmed ? 'Confirmado' : 'Estimado'}
                </p>
              </div>
              {anime.hype && (
                <div className="flex items-center space-x-1">
                  <Zap className="text-yellow-400" size={14} />
                  <span className="text-yellow-400 text-sm font-bold">{anime.hype}%</span>
                </div>
              )}
            </div>
          </div>
        ) : anime.airingInfo ? (
          <div className="bg-green-600/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">
                  Ep. {anime.airingInfo.nextEpisode}
                </p>
                <p className="text-gray-300 text-xs">
                  {anime.airingInfo.dayOfWeek} {anime.airingInfo.timeJST} JST
                </p>
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-bold">
                  {getTimeUntilAiring(anime.airingInfo.airingAt)}
                </p>
                <p className="text-gray-400 text-xs">restante</p>
              </div>
            </div>
          </div>
        ) : anime.finishedDate ? (
          <div className="bg-blue-600/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Finalizado</p>
                <p className="text-gray-300 text-xs">
                  {new Date(anime.finishedDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="text-green-400" size={16} />
                <span className="text-green-400 text-sm">{anime.episodes} eps</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-4">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
            {isUpcoming ? 'Seguir' : 'Ver Ahora'}
          </button>
          <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
            <Plus size={16} />
          </button>
          <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderCalendarView = () => (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Calendario de Emisión</h3>
      
      <div className="grid grid-cols-7 gap-4">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-300 py-2">
            {day}
          </div>
        ))}
        
        {Array.from({ length: 35 }, (_, i) => {
          const dayNumber = i - 6; // Adjust for month start
          const hasAnime = dayNumber > 0 && dayNumber <= 31 && Math.random() > 0.7;
          
          return (
            <div 
              key={i}
              className={`min-h-[100px] p-2 border border-gray-700 rounded-lg ${
                dayNumber > 0 && dayNumber <= 31 ? 'bg-gray-700' : 'bg-gray-800'
              }`}
            >
              {dayNumber > 0 && dayNumber <= 31 && (
                <>
                  <div className="text-white text-sm mb-2">{dayNumber}</div>
                  {hasAnime && (
                    <div className="space-y-1">
                      <div className="bg-green-600 text-white text-xs p-1 rounded">
                        Frieren EP{15 + dayNumber % 3}
                      </div>
                      {dayNumber % 7 === 0 && (
                        <div className="bg-blue-600 text-white text-xs p-1 rounded">
                          Solo Leveling EP{dayNumber % 4 + 1}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Calendario de Anime</h1>
          <p className="text-gray-400">Mantente al día con los últimos episodios y próximos lanzamientos</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
            {[
              { id: 'current', label: 'En Emisión', icon: Play },
              { id: 'upcoming', label: 'Próximamente', icon: Calendar },
              { id: 'recent', label: 'Recientes', icon: Clock },
              { id: 'calendar', label: 'Calendario', icon: Timer }
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

          <div className="flex items-center space-x-4">
            {/* Season Selector */}
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {seasons.map(season => (
                <option key={season.value} value={season.value}>
                  {season.label}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            {activeTab !== 'calendar' && (
              <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Monitor size={20} />
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
            )}

            {/* Refresh Button */}
            <button 
              onClick={() => setLoading(true)}
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-green-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">En Emisión</p>
                <p className="text-2xl font-bold">{mockCurrentSeason.length}</p>
              </div>
              <Play size={32} className="text-green-200" />
            </div>
          </div>

          <div className="bg-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Próximamente</p>
                <p className="text-2xl font-bold">{mockUpcoming.length}</p>
              </div>
              <Calendar size={32} className="text-purple-200" />
            </div>
          </div>

          <div className="bg-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Siguiendo</p>
                <p className="text-2xl font-bold">{notifications.size}</p>
              </div>
              <Bell size={32} className="text-blue-200" />
            </div>
          </div>

          <div className="bg-orange-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Próximo Episodio</p>
                <p className="text-lg font-bold">
                  {getTimeUntilAiring(mockCurrentSeason[0]?.airingInfo?.airingAt)}
                </p>
              </div>
              <Clock size={32} className="text-orange-200" />
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'calendar' ? (
          renderCalendarView()
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-6'
          }`}>
            {activeTab === 'current' && mockCurrentSeason.map(anime => renderAnimeCard(anime))}
            {activeTab === 'upcoming' && mockUpcoming.map(anime => renderAnimeCard(anime, true))}
            {activeTab === 'recent' && mockRecentlyFinished.map(anime => renderAnimeCard(anime))}
          </div>
        )}

        {/* Platform Legend */}
        <div className="mt-12 bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Plataformas de Streaming</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platforms.map(platform => {
              const IconComponent = platform.icon;
              return (
                <div key={platform.name} className="flex items-center space-x-3">
                  <div className={`p-2 rounded ${platform.color} text-white`}>
                    <IconComponent size={20} />
                  </div>
                  <span className="text-gray-300">{platform.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiringsUpcomingPage;