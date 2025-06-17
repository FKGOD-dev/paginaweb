import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Star, 
  Eye, 
  Heart, 
  BookOpen, 
  Calendar,
  ArrowRight,
  Play,
  Clock,
  Users,
  Flame,
  Award,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { apiService } from './useApi';

const RealHomePage = () => {
  const [topManga, setTopManga] = useState([]);
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [seasonalAnime, setSeasonalAnime] = useState([]);
  const [featuredItem, setFeaturedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos reales de múltiples APIs
      const [topMangaRes, seasonalAnimeRes, trendingMangaRes] = await Promise.all([
        apiService.external.jikan.getTopManga(1),
        apiService.external.jikan.getSeasonalAnime(),
        apiService.external.anilist.getTrendingManga()
      ]);

      console.log('API Responses:', { topMangaRes, seasonalAnimeRes, trendingMangaRes });

      // Procesar top manga de Jikan
      if (topMangaRes?.data) {
        const processedManga = topMangaRes.data.slice(0, 12).map(manga => ({
          id: manga.mal_id,
          title: manga.title,
          cover: manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url,
          score: manga.score,
          rank: manga.rank,
          synopsis: manga.synopsis?.substring(0, 200) + '...',
          genres: manga.genres?.map(g => g.name) || [],
          year: manga.published?.from ? new Date(manga.published.from).getFullYear() : null,
          chapters: manga.chapters,
          status: manga.status,
          authors: manga.authors?.map(a => a.name) || [],
          type: 'manga'
        }));
        setTopManga(processedManga);
        
        // Usar el primer manga como featured
        if (processedManga[0]) {
          setFeaturedItem(processedManga[0]);
        }
      }

      // Procesar anime de temporada actual
      if (seasonalAnimeRes?.data) {
        const processedAnime = seasonalAnimeRes.data.slice(0, 8).map(anime => ({
          id: anime.mal_id,
          title: anime.title,
          cover: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
          score: anime.score,
          synopsis: anime.synopsis?.substring(0, 150) + '...',
          genres: anime.genres?.map(g => g.name) || [],
          year: anime.year,
          episodes: anime.episodes,
          status: anime.status,
          type: 'anime',
          airing: anime.airing
        }));
        setSeasonalAnime(processedAnime);
      }

      // Procesar trending manga de AniList
      if (trendingMangaRes?.data?.Page?.media) {
        const processedTrending = trendingMangaRes.data.Page.media.slice(0, 6).map(manga => ({
          id: manga.id,
          title: manga.title?.english || manga.title?.romaji,
          cover: manga.coverImage?.large || manga.coverImage?.medium,
          banner: manga.bannerImage,
          score: manga.averageScore ? manga.averageScore / 10 : null,
          synopsis: manga.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
          genres: manga.genres || [],
          year: manga.startDate?.year,
          chapters: manga.chapters,
          status: manga.status?.toLowerCase(),
          type: 'manga',
          isTrending: true
        }));
        setTrendingAnime(processedTrending);
      }

    } catch (err) {
      console.error('Error loading real data:', err);
      setError('Error al cargar datos. Intenta recargar la página.');
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (trendingAnime.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % trendingAnime.length);
    }
  };

  const prevSlide = () => {
    if (trendingAnime.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + trendingAnime.length) % trendingAnime.length);
    }
  };

  const MangaCard = ({ item, showScore = true, size = "normal" }) => {
    const cardSize = size === "small" ? "w-24 h-32" : "w-40 h-56";
    
    return (
      <div className="group cursor-pointer">
        <div className={`${cardSize} relative overflow-hidden rounded-lg bg-gray-800 transition-transform group-hover:scale-105`}>
          {item.cover ? (
            <img
              src={item.cover}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x400/374151/9CA3AF?text=No+Image';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-gray-500" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-8 h-8 text-white" />
          </div>
          
          {showScore && item.score && (
            <div className="absolute top-2 right-2 bg-black/70 rounded px-2 py-1">
              <div className="flex items-center text-yellow-500">
                <Star className="w-3 h-3 mr-1 fill-current" />
                <span className="text-xs text-white">{item.score.toFixed(1)}</span>
              </div>
            </div>
          )}
          
          {item.rank && (
            <div className="absolute top-2 left-2 bg-orange-500 rounded px-2 py-1">
              <span className="text-xs font-bold text-white">#{item.rank}</span>
            </div>
          )}
          
          {item.isTrending && (
            <div className="absolute bottom-2 left-2">
              <div className="flex items-center bg-red-500 rounded px-2 py-1">
                <Flame className="w-3 h-3 mr-1" />
                <span className="text-xs font-medium">TRENDING</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-2">
          <h3 className="text-white font-medium text-sm line-clamp-2 leading-tight">
            {item.title}
          </h3>
          {item.year && (
            <div className="flex items-center text-gray-400 text-xs mt-1">
              <Calendar className="w-3 h-3 mr-1" />
              {item.year}
            </div>
          )}
        </div>
      </div>
    );
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-gray-800 rounded-lg p-6 text-center">
      <Icon className={`w-8 h-8 mx-auto mb-3 ${color}`} />
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Cargando contenido desde APIs reales...</p>
          <p className="text-gray-400 text-sm mt-2">MyAnimeList • AniList • Jikan API</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl mb-2">Error al cargar datos</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={loadRealData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {featuredItem?.banner || featuredItem?.cover ? (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${featuredItem.banner || featuredItem.cover})`,
                filter: 'blur(8px) brightness(0.3)'
              }}
            />
            <div className="absolute inset-0 bg-black/60" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900" />
        )}
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            MangaVerse
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Descubre miles de manga y anime con datos reales de MyAnimeList y AniList
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Explorar Manga Real
            </button>
            <button className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Ver Trending
            </button>
          </div>
        </div>

        {/* Real Stats */}
        <div className="absolute bottom-8 left-0 right-0 z-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard 
                icon={BookOpen} 
                label="Top Manga" 
                value={topManga.length}
                color="text-blue-500"
              />
              <StatCard 
                icon={TrendingUp} 
                label="Trending" 
                value={trendingAnime.length}
                color="text-green-500"
              />
              <StatCard 
                icon={Calendar} 
                label="Esta Temporada" 
                value={seasonalAnime.length}
                color="text-purple-500"
              />
              <StatCard 
                icon={Star} 
                label="APIs Conectadas" 
                value="3"
                color="text-orange-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Item */}
      {featuredItem && (
        <section className="py-16 bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 text-orange-500 mb-4">
                  <Award className="w-6 h-6" />
                  <span className="font-semibold text-lg">#{featuredItem.rank} en MyAnimeList</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold mb-4">{featuredItem.title}</h2>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {featuredItem.genres.slice(0, 4).map((genre, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-600 rounded-full text-sm">
                      {genre}
                    </span>
                  ))}
                </div>
                
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  {featuredItem.synopsis}
                </p>
                
                <div className="flex items-center gap-6 mb-8">
                  {featuredItem.score && (
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 mr-2 fill-current" />
                      <span className="text-xl font-bold">{featuredItem.score.toFixed(1)}</span>
                      <span className="text-gray-400 ml-1">/10</span>
                    </div>
                  )}
                  {featuredItem.chapters && (
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 text-green-500 mr-2" />
                      <span>{featuredItem.chapters} capítulos</span>
                    </div>
                  )}
                  {featuredItem.year && (
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-blue-500 mr-2" />
                      <span>{featuredItem.year}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center">
                    <Play className="w-5 h-5 mr-2" />
                    Ver en MAL
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Favoritos
                  </button>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={featuredItem.cover}
                    alt={featuredItem.title}
                    className="w-80 h-96 object-cover rounded-2xl shadow-2xl"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/320x384/374151/9CA3AF?text=No+Image';
                    }}
                  />
                  <div className="absolute -top-4 -right-4 bg-orange-500 text-white px-4 py-2 rounded-full font-bold">
                    #{featuredItem.rank}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trending Carousel */}
      {trendingAnime.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <h2 className="text-3xl font-bold">Trending en AniList</h2>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={prevSlide}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {trendingAnime.map((item, index) => (
                  <div key={item.id} className="w-full flex-shrink-0">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-8 rounded-xl flex items-center gap-8">
                      <div className="text-6xl font-bold text-gray-600">
                        #{index + 1}
                      </div>
                      <img
                        src={item.cover}
                        alt={item.title}
                        className="w-32 h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/128x192/374151/9CA3AF?text=No+Image';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                        <p className="text-gray-300 mb-4 line-clamp-3">{item.synopsis}</p>
                        <div className="flex items-center gap-4 mb-4">
                          {item.score && (
                            <div className="flex items-center">
                              <Star className="w-5 h-5 text-yellow-500 mr-2 fill-current" />
                              <span>{item.score.toFixed(1)}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Flame className="w-5 h-5 text-orange-500 mr-2" />
                            <span>Trending</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {item.genres.slice(0, 3).map((genre, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-600 text-xs rounded">
                              {genre}
                            </span>
                          ))}
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Top Manga Grid */}
      {topManga.length > 0 && (
        <section className="py-16 bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-yellow-500" />
                <h2 className="text-3xl font-bold">Top Manga en MyAnimeList</h2>
              </div>
              <button className="text-blue-500 hover:text-blue-400 flex items-center">
                Ver todos <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {topManga.slice(0, 12).map(manga => (
                <MangaCard key={manga.id} item={manga} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Seasonal Anime */}
      {seasonalAnime.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-green-500" />
                <h2 className="text-3xl font-bold">Anime de Esta Temporada</h2>
              </div>
              <button className="text-blue-500 hover:text-blue-400 flex items-center">
                Ver todos <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {seasonalAnime.slice(0, 12).map(anime => (
                <MangaCard key={anime.id} item={anime} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* API Info Banner */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Datos Reales en Tiempo Real</h2>
          <p className="text-xl text-blue-100 mb-6">
            Conectado con las mejores APIs de manga y anime
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Jikan API (MyAnimeList)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>AniList GraphQL API</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>MangaVerse Backend</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RealHomePage;