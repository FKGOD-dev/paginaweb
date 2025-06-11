// pages/AnimeDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Heart, 
  Star, 
  Calendar, 
  Users, 
  Clock, 
  Tag,
  ExternalLink,
  Share2,
  Bookmark,
  MessageCircle,
  ThumbsUp,
  Eye
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CharacterCard from '../components/cards/CharacterCard';

const AnimeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    fetchAnimeDetails();
  }, [id]);

  const fetchAnimeDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch anime details
      const animeResponse = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`);
      const animeData = await animeResponse.json();
      
      // Fetch characters
      const charactersResponse = await fetch(`https://api.jikan.moe/v4/anime/${id}/characters`);
      const charactersData = await charactersResponse.json();
      
      // Fetch recommendations
      const recommendationsResponse = await fetch(`https://api.jikan.moe/v4/anime/${id}/recommendations`);
      const recommendationsData = await recommendationsResponse.json();
      
      setAnime(animeData.data);
      setCharacters(charactersData.data?.slice(0, 12) || []);
      setRecommendations(recommendationsData.data?.slice(0, 6) || []);
    } catch (error) {
      console.error('Error fetching anime details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    // Aquí iría la lógica para guardar en favorites
  };

  const handleRating = (rating) => {
    setUserRating(rating);
    // Aquí iría la lógica para enviar rating al backend
  };

  if (loading) {
    return <LoadingSpinner size="xl" text="Cargando detalles del anime..." />;
  }

  if (!anime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Anime no encontrado
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url})`,
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 h-full flex items-end pb-8">
          <div className="flex gap-6 w-full">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
                alt={anime.title}
                className="w-48 h-72 object-cover rounded-lg shadow-2xl"
              />
            </div>
            
            {/* Info */}
            <div className="flex-1 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{anime.title}</h1>
                  {anime.title_english && anime.title_english !== anime.title && (
                    <h2 className="text-xl text-gray-300 mb-2">{anime.title_english}</h2>
                  )}
                  {anime.title_japanese && (
                    <h3 className="text-lg text-gray-400">{anime.title_japanese}</h3>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleFavoriteToggle}
                    className={`p-3 rounded-full transition-colors ${
                      isFavorite 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
                  </button>
                  <button className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{anime.score || 'N/A'}</span>
                  <span className="text-gray-300">({anime.scored_by?.toLocaleString()} votos)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  <span>{anime.favorites?.toLocaleString() || 0} favoritos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-400" />
                  <span>{anime.members?.toLocaleString() || 0} miembros</span>
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 text-sm">
                {anime.year && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{anime.year}</span>
                  </div>
                )}
                {anime.episodes && (
                  <div className="flex items-center gap-1">
                    <Play className="w-4 h-4" />
                    <span>{anime.episodes} episodios</span>
                  </div>
                )}
                {anime.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{anime.duration}</span>
                  </div>
                )}
                {anime.status && (
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      anime.status === 'Finished Airing' 
                        ? 'bg-green-600 text-white' 
                        : anime.status === 'Currently Airing'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-600 text-white'
                    }`}>
                      {anime.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="characters">Personajes</TabsTrigger>
            <TabsTrigger value="episodes">Episodios</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          </TabsList>

          {/* Información */}
          <TabsContent value="info" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Synopsis */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    Sinopsis
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {anime.synopsis || 'No hay sinopsis disponible.'}
                  </p>
                </div>

                {/* Genres */}
                {anime.genres && anime.genres.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mt-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      Géneros
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {anime.genres.map((genre) => (
                        <span
                          key={genre.mal_id}
                          className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 cursor-pointer transition-colors"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    Detalles
                  </h3>
                  <div className="space-y-3 text-sm">
                    {/* CORREGIDO: Tipo */}
                    {anime.type && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tipo:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {anime.type}
                        </span>
                      </div>
                    )}
                    {/* CORREGIDO: Fuente */}
                    {anime.source && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Fuente:</span>
                        <span className="text-gray-900 dark:text-white font-medium">{anime.source}</span>
                      </div>
                    )}
                    {/* CORREGIDO: Estudios */}
                    {anime.studios && anime.studios.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Estudio:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {anime.studios.map(studio => studio.name).join(', ')}
                        </span>
                      </div>
                    )}
                    {anime.aired?.string && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Emisión:</span>
                        <span className="text-gray-900 dark:text-white font-medium">{anime.aired.string}</span>
                      </div>
                    )}
                    {anime.rating && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Clasificación:</span>
                        <span className="text-gray-900 dark:text-white font-medium">{anime.rating}</span>
                      </div>
                    )}
                    {anime.rank && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Ranking:</span>
                        <span className="text-gray-900 dark:text-white font-medium">#{anime.rank}</span>
                      </div>
                    )}
                    {anime.popularity && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Popularidad:</span>
                        <span className="text-gray-900 dark:text-white font-medium">#{anime.popularity}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Rating */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    Tu Calificación
                  </h3>
                  <div className="flex justify-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= userRating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {userRating > 0 && (
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                      Has calificado este anime con {userRating} estrellas
                    </p>
                  )}
                </div>

                {/* External Links */}
                {anime.external && anime.external.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                      Enlaces Externos
                    </h3>
                    <div className="space-y-2">
                      {anime.external.slice(0, 5).map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {link.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Streaming Platforms */}
                {anime.streaming && anime.streaming.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                      Ver en
                    </h3>
                    <div className="space-y-2">
                      {anime.streaming.map((platform, index) => (
                        <a
                          key={index}
                          href={platform.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          {platform.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    Agregar a Lista
                  </h3>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Completado
                    </button>
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Viendo
                    </button>
                    <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                      Planificar Ver
                    </button>
                    <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      Abandonado
                    </button>
                    <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      En Pausa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Personajes */}
          <TabsContent value="characters" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Personajes Principales
              </h3>
              {characters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {characters.map((char) => (
                    <div key={char.character.mal_id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="text-center">
                        <img
                          src={char.character.images?.jpg?.image_url || '/placeholder-character.png'}
                          alt={char.character.name}
                          className="w-20 h-28 object-cover rounded-lg mx-auto mb-3 shadow-md"
                        />
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                          {char.character.name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {char.role}
                        </p>
                        {char.voice_actors && char.voice_actors.length > 0 && (
                          <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                              CV: {char.voice_actors[0].person.name}
                            </p>
                            <img
                              src={char.voice_actors[0].person.images?.jpg?.image_url}
                              alt={char.voice_actors[0].person.name}
                              className="w-6 h-6 object-cover rounded-full mx-auto"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    No hay información de personajes disponible.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Episodios */}
          <TabsContent value="episodes" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Lista de Episodios
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{anime.episodes || '?'} episodios</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {anime.episodes ? (
                  Array.from({ length: Math.min(anime.episodes, 12) }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                      <div className="w-12 h-8 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center">
                        <Play className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Episodio {index + 1}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Título del episodio disponible próximamente
                        </p>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {anime.duration || '24 min'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Los episodios estarán disponibles próximamente
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Total de episodios: {anime.episodes || 'Desconocido'}
                    </p>
                  </div>
                )}
              </div>

              {anime.episodes > 12 && (
                <div className="text-center mt-6">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Ver todos los episodios ({anime.episodes})
                  </button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Reviews de la Comunidad
                </h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Escribir Review
                </button>
              </div>
              
              {/* Estadísticas de reviews */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{anime.score || 'N/A'}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Puntuación</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{anime.scored_by?.toLocaleString() || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Votos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{anime.rank || 'N/A'}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Ranking</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{anime.popularity || 'N/A'}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Popularidad</div>
                </div>
              </div>

              {/* Lista de reviews */}
              <div className="space-y-6">
                {[1, 2, 3].map((review) => (
                  <div key={review} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        U{review}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-gray-900 dark:text-white">Usuario{review}</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= (review + 2) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {review === 1 ? 'Hace 2 días' : review === 2 ? 'Hace 1 semana' : 'Hace 2 semanas'}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                          {review === 1 
                            ? "Excelente anime con una animación impresionante y una historia muy bien desarrollada. Los personajes están bien caracterizados y la banda sonora es espectacular. Definitivamente recomendado para cualquier fan del género."
                            : review === 2 
                            ? "Me gustó mucho este anime. La trama es interesante aunque a veces se siente un poco lenta. Los momentos de acción están muy bien ejecutados y el desarrollo de personajes es sólido."
                            : "Un anime decente con buenos momentos, pero siento que podría haber sido mejor. Algunos episodios se sienten como relleno y el final fue un poco apresurado. Aún así, vale la pena verlo."
                          }
                        </p>
                        <div className="flex items-center gap-6 text-sm">
                          <button className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{review * 8 + 4} útiles</span>
                          </button>
                          <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span>Responder</span>
                          </button>
                          <button className="text-gray-500 hover:text-gray-700 transition-colors">
                            Reportar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Cargar más reviews
                </button>
              </div>
            </div>
          </TabsContent>

          {/* Recomendaciones */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                Animes Similares
              </h3>
              {recommendations.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    {recommendations.map((rec) => (
                      <div
                        key={rec.entry.mal_id}
                        className="cursor-pointer group"
                        onClick={() => navigate(`/anime/${rec.entry.mal_id}`)}
                      >
                        <div className="relative overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-all duration-300">
                          <img
                            src={rec.entry.images?.jpg?.image_url || '/placeholder-anime.png'}
                            alt={rec.entry.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {rec.votes} votos
                            </div>
                          </div>
                        </div>
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white mt-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {rec.entry.title}
                        </h4>
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      Ver más recomendaciones
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
                    No hay recomendaciones disponibles.
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Las recomendaciones aparecerán cuando otros usuarios las agreguen.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Fixed Bottom Actions (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 md:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={handleFavoriteToggle}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              isFavorite 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          >
            <Heart className={`w-5 h-5 mx-auto ${isFavorite ? 'fill-white' : ''}`} />
          </button>
          <button className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium">
            Ver Ahora
          </button>
          <button className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailPage;