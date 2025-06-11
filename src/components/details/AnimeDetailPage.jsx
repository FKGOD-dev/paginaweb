// src/components/details/AnimeDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Star, 
  Heart, 
  Bookmark, 
  Share2, 
  Calendar, 
  Clock, 
  Users, 
  Award,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Check,
  Eye,
  TrendingUp,
  Book,
  User,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Flag,
  Edit,
  Video,
  Music,
  Tv
} from 'lucide-react';

const AnimeDetailPage = ({ animeId, type = 'anime' }) => {
  const [animeData, setAnimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState({
    watchStatus: 'not_watching', // watching, completed, on_hold, dropped, plan_to_watch
    rating: 0,
    isFavorite: false,
    progress: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);

  // Mock data - en producción vendría de la API
  const mockAnimeData = {
    mal_id: 16498,
    title: "Attack on Titan",
    title_english: "Attack on Titan",
    title_japanese: "進撃の巨人",
    title_synonyms: ["Shingeki no Kyojin", "AoT"],
    images: {
      jpg: {
        image_url: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
        large_image_url: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg"
      }
    },
    trailer: {
      youtube_id: "LHtdKWJdif4",
      url: "https://www.youtube.com/watch?v=LHtdKWJdif4"
    },
    type: "TV",
    source: "Manga",
    episodes: 25,
    status: "Finished Airing",
    aired: {
      from: "2013-04-07T00:00:00+00:00",
      to: "2013-09-29T00:00:00+00:00",
      string: "Apr 7, 2013 to Sep 29, 2013"
    },
    duration: "24 min per ep",
    rating: "R - 17+ (violence & profanity)",
    score: 9.0,
    scored_by: 1800000,
    rank: 1,
    popularity: 1,
    members: 3200000,
    favorites: 180000,
    synopsis: "Centuries ago, mankind was slaughtered to near extinction by monstrous humanoid creatures called Titans, forcing humans to hide in fear behind enormous concentric walls. What makes these giants truly terrifying is that their taste for human flesh is not born out of hunger but what appears to be out of pleasure. To ensure their survival, the remnants of humanity began living within defensive barriers, resulting in one hundred years without a single titan encounter. However, that fragile calm is soon shattered when a colossal Titan manages to breach the supposedly impregnable outer wall, reigniting the fight for survival against the man-eating abominations.",
    background: "Attack on Titan is based on the manga series of the same name by Hajime Isayama.",
    season: "spring",
    year: 2013,
    broadcast: {
      day: "Sundays",
      time: "01:58",
      timezone: "Asia/Tokyo",
      string: "Sundays at 01:58 (JST)"
    },
    producers: [
      { mal_id: 10, name: "Production I.G", url: "https://myanimelist.net/anime/producer/10" },
      { mal_id: 53, name: "Dentsu", url: "https://myanimelist.net/anime/producer/53" }
    ],
    licensors: [
      { mal_id: 102, name: "Funimation", url: "https://myanimelist.net/anime/producer/102" }
    ],
    studios: [
      { mal_id: 858, name: "Wit Studio", url: "https://myanimelist.net/anime/producer/858" }
    ],
    genres: [
      { mal_id: 1, name: "Action", url: "https://myanimelist.net/anime/genre/1" },
      { mal_id: 8, name: "Drama", url: "https://myanimelist.net/anime/genre/8" },
      { mal_id: 10, name: "Fantasy", url: "https://myanimelist.net/anime/genre/10" }
    ],
    themes: [
      { mal_id: 58, name: "Gore", url: "https://myanimelist.net/anime/genre/58" },
      { mal_id: 38, name: "Military", url: "https://myanimelist.net/anime/genre/38" },
      { mal_id: 76, name: "Survival", url: "https://myanimelist.net/anime/genre/76" }
    ],
    demographics: [
      { mal_id: 27, name: "Shounen", url: "https://myanimelist.net/anime/genre/27" }
    ]
  };

  const mockCharacters = [
    {
      character: {
        mal_id: 40881,
        name: "Eren Yeager",
        images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/10/216895.jpg" } }
      },
      role: "Main",
      voice_actors: [
        {
          person: {
            mal_id: 16,
            name: "Kaji, Yuki",
            images: { jpg: { image_url: "https://cdn.myanimelist.net/images/voiceactors/2/23123.jpg" } }
          },
          language: "Japanese"
        }
      ]
    },
    {
      character: {
        mal_id: 40882,
        name: "Mikasa Ackerman",
        images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/9/215563.jpg" } }
      },
      role: "Main",
      voice_actors: [
        {
          person: {
            mal_id: 15,
            name: "Ishikawa, Yui",
            images: { jpg: { image_url: "https://cdn.myanimelist.net/images/voiceactors/1/52791.jpg" } }
          },
          language: "Japanese"
        }
      ]
    }
  ];

  const mockRecommendations = [
    {
      entry: {
        mal_id: 1735,
        title: "Naruto",
        images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/13/17405l.jpg" } }
      },
      votes: 15623
    },
    {
      entry: {
        mal_id: 20,
        title: "Naruto",
        images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/13/17405l.jpg" } }
      },
      votes: 12034
    }
  ];

  useEffect(() => {
    loadAnimeData();
  }, [animeId]);

  const loadAnimeData = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnimeData(mockAnimeData);
    } catch (error) {
      console.error('Error loading anime data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setUserStatus(prev => ({ ...prev, watchStatus: newStatus }));
  };

  const handleRating = (rating) => {
    setUserStatus(prev => ({ ...prev, rating }));
  };

  const toggleFavorite = () => {
    setUserStatus(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'Finished Airing': 'bg-green-500',
      'Currently Airing': 'bg-blue-500',
      'Not yet aired': 'bg-yellow-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const watchStatusOptions = [
    { value: 'watching', label: 'Viendo', color: 'bg-blue-600' },
    { value: 'completed', label: 'Completado', color: 'bg-green-600' },
    { value: 'on_hold', label: 'En Pausa', color: 'bg-yellow-600' },
    { value: 'dropped', label: 'Abandonado', color: 'bg-red-600' },
    { value: 'plan_to_watch', label: 'Planeo Ver', color: 'bg-purple-600' }
  ];

  const formatScore = (score) => score ? score.toFixed(1) : 'N/A';
  const formatMembers = (members) => {
    if (members >= 1000000) {
      return `${(members / 1000000).toFixed(1)}M`;
    } else if (members >= 1000) {
      return `${(members / 1000).toFixed(1)}K`;
    }
    return members?.toString() || '0';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (!animeData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">Error al cargar los datos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={animeData.images.jpg.large_image_url}
            alt={animeData.title}
            className="w-full h-full object-cover scale-110 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/90"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Poster */}
              <div className="flex-shrink-0">
                <img 
                  src={animeData.images.jpg.large_image_url}
                  alt={animeData.title}
                  className="w-64 h-96 object-cover rounded-xl shadow-2xl"
                />
              </div>

              {/* Info */}
              <div className="flex-1 max-w-3xl">
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(animeData.status)}`}>
                    {animeData.status}
                  </span>
                  <span className="text-gray-300">{animeData.type}</span>
                  {animeData.episodes && (
                    <span className="text-gray-300">{animeData.episodes} episodios</span>
                  )}
                  <span className="text-gray-300">{animeData.year}</span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  {animeData.title}
                </h1>

                {animeData.title_english && animeData.title_english !== animeData.title && (
                  <h2 className="text-xl text-gray-300 mb-4">{animeData.title_english}</h2>
                )}

                <div className="flex items-center space-x-6 mb-6">
                  <div className="flex items-center space-x-2">
                    <Star className="text-yellow-400 fill-current" size={24} />
                    <span className="text-white font-bold text-xl">{formatScore(animeData.score)}</span>
                    <span className="text-gray-300">({formatMembers(animeData.scored_by)})</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Award className="text-purple-400" size={20} />
                    <span className="text-white">#{animeData.rank}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <TrendingUp className="text-green-400" size={20} />
                    <span className="text-white">#{animeData.popularity}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Users className="text-blue-400" size={20} />
                    <span className="text-gray-300">{formatMembers(animeData.members)}</span>
                  </div>
                </div>

                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  {showFullSynopsis ? animeData.synopsis : `${animeData.synopsis.slice(0, 300)}...`}
                  <button
                    onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                    className="text-blue-400 hover:text-blue-300 ml-2 transition-colors"
                  >
                    {showFullSynopsis ? 'Ver menos' : 'Ver más'}
                  </button>
                </p>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {animeData.genres.map(genre => (
                    <span key={genre.mal_id} className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                      {genre.name}
                    </span>
                  ))}
                  {animeData.themes.map(theme => (
                    <span key={theme.mal_id} className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
                      {theme.name}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    <Play size={20} />
                    <span>Ver Ahora</span>
                  </button>

                  <div className="relative">
                    <select 
                      value={userStatus.watchStatus}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors appearance-none pr-10"
                    >
                      <option value="not_watching">Añadir a Lista</option>
                      {watchStatusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>

                  <button 
                    onClick={toggleFavorite}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                      userStatus.isFavorite 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                  >
                    <Heart className={userStatus.isFavorite ? 'fill-current' : ''} size={20} />
                    <span>{userStatus.isFavorite ? 'Favorito' : 'Añadir a Favoritos'}</span>
                  </button>

                  <button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    <Share2 size={20} />
                    <span>Compartir</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg w-fit">
          {[
            { id: 'overview', label: 'Información' },
            { id: 'characters', label: 'Personajes' },
            { id: 'staff', label: 'Staff' },
            { id: 'recommendations', label: 'Recomendaciones' },
            { id: 'reviews', label: 'Reseñas' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Synopsis */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Sinopsis</h3>
                <p className="text-gray-300 leading-relaxed">{animeData.synopsis}</p>
                {animeData.background && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="text-lg font-semibold text-white mb-2">Información Adicional</h4>
                    <p className="text-gray-300">{animeData.background}</p>
                  </div>
                )}
              </div>

              {/* Trailer */}
              {animeData.trailer && (
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Trailer</h3>
                  <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Video size={48} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">Trailer disponible</p>
                      <a 
                        href={animeData.trailer.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Ver en YouTube
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Estadísticas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Puntuación:</span>
                    <span className="text-white font-semibold">{formatScore(animeData.score)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ranking:</span>
                    <span className="text-white">#{animeData.rank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Popularidad:</span>
                    <span className="text-white">#{animeData.popularity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Miembros:</span>
                    <span className="text-white">{formatMembers(animeData.members)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Favoritos:</span>
                    <span className="text-white">{formatMembers(animeData.favorites)}</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Detalles</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-400 block">Tipo:</span>
                    <span className="text-white">{animeData.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Episodios:</span>
                    <span className="text-white">{animeData.episodes || 'Desconocido'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Estado:</span>
                    <span className="text-white">{animeData.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Emitido:</span>
                    <span className="text-white">{animeData.aired.string}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Duración:</span>
                    <span className="text-white">{animeData.duration}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Clasificación:</span>
                    <span className="text-white">{animeData.rating}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Fuente:</span>
                    <span className="text-white">{animeData.source}</span>
                  </div>
                  {animeData.studios.length > 0 && (
                    <div>
                      <span className="text-gray-400 block">Estudio:</span>
                      <span className="text-white">{animeData.studios.map(s => s.name).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* User Rating */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Tu Puntuación</h3>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRating(rating)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        userStatus.rating >= rating
                          ? 'bg-yellow-400 text-gray-900'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Tu puntuación: {userStatus.rating > 0 ? userStatus.rating : 'Sin calificar'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'characters' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCharacters.map(item => (
              <div key={item.character.mal_id} className="bg-gray-800 rounded-xl p-4">
                <div className="flex space-x-4">
                  <img 
                    src={item.character.images.jpg.image_url}
                    alt={item.character.name}
                    className="w-16 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold truncate">{item.character.name}</h4>
                    <p className="text-gray-400 text-sm">{item.role}</p>
                    {item.voice_actors[0] && (
                      <div className="mt-2 flex items-center space-x-2">
                        <img 
                          src={item.voice_actors[0].person.images.jpg.image_url}
                          alt={item.voice_actors[0].person.name}
                          className="w-6 h-6 object-cover rounded-full"
                        />
                        <span className="text-gray-300 text-sm truncate">
                          {item.voice_actors[0].person.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {mockRecommendations.map(item => (
              <div key={item.entry.mal_id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg">
                  <img 
                    src={item.entry.images.jpg.large_image_url}
                    alt={item.entry.title}
                    className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-center space-x-1">
                        <ThumbsUp size={14} className="text-green-400" />
                        <span className="text-white text-sm">{item.votes}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <h4 className="text-white font-medium mt-2 text-sm line-clamp-2 group-hover:text-blue-400 transition-colors">
                  {item.entry.title}
                </h4>
              </div>
            ))}
          </div>
        )}

        {(activeTab === 'staff' || activeTab === 'reviews') && (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <MessageCircle size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {activeTab === 'staff' ? 'Staff' : 'Reseñas'}
            </h3>
            <p className="text-gray-400">Próximamente disponible</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimeDetailPage;