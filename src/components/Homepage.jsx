// src/components/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Star, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Users, 
  Heart,
  BookOpen,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Plus,
  Bookmark,
  ArrowRight
} from 'lucide-react';

// Mock del servicio - en producción importarías el real
const mockAnimeService = {
  async getHomepageData() {
    // Simulamos una llamada a la API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      featured: [
        {
          mal_id: 1,
          title: "Attack on Titan: The Final Season",
          title_english: "Attack on Titan: The Final Season",
          synopsis: "The final season of the epic saga that changed anime forever. Humanity's fate hangs in the balance as Eren Yeager's true intentions are revealed.",
          images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1948/120625l.jpg" } },
          score: 9.0,
          members: 1200000,
          genres: [{ name: "Action" }, { name: "Drama" }, { name: "Fantasy" }],
          status: "Finished Airing",
          type: "TV",
          episodes: 12,
          year: 2023
        },
        {
          mal_id: 2,
          title: "Demon Slayer: Kimetsu no Yaiba",
          title_english: "Demon Slayer",
          synopsis: "A young boy becomes a demon slayer to save his sister and avenge his family. Stunning animation meets compelling storytelling.",
          images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg" } },
          score: 8.7,
          members: 2100000,
          genres: [{ name: "Action" }, { name: "Supernatural" }, { name: "Historical" }],
          status: "Finished Airing",
          type: "TV",
          episodes: 26,
          year: 2019
        },
        {
          mal_id: 3,
          title: "Jujutsu Kaisen",
          title_english: "Jujutsu Kaisen",
          synopsis: "A high school student joins a secret organization to fight cursed spirits and save humanity from supernatural threats.",
          images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg" } },
          score: 8.5,
          members: 1800000,
          genres: [{ name: "Action" }, { name: "Supernatural" }, { name: "School" }],
          status: "Finished Airing",
          type: "TV",
          episodes: 24,
          year: 2020
        }
      ],
      topAnime: [
        {
          mal_id: 4,
          title: "Fullmetal Alchemist: Brotherhood",
          images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1223/96541l.jpg" } },
          score: 9.1,
          members: 3000000,
          rank: 1
        },
        {
          mal_id: 5,
          title: "Your Name",
          images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/5/87048l.jpg" } },
          score: 8.4,
          members: 1900000,
          rank: 2
        }
      ],
      trending: [
        {
          mal_id: 6,
          title: "One Piece",
          images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg" } },
          score: 9.0,
          members: 2800000,
          status: "Currently Airing"
        },
        {
          mal_id: 7,
          title: "Naruto",
          images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/13/17405l.jpg" } },
          score: 8.3,
          members: 2200000,
          status: "Finished Airing"
        }
      ],
      upcoming: [
        {
          mal_id: 8,
          title: "Chainsaw Man Season 2",
          images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1806/126216l.jpg" } },
          score: null,
          members: 800000,
          status: "Not yet aired"
        }
      ]
    };
  }
};

const HomePage = () => {
  const [data, setData] = useState({
    featured: [],
    topAnime: [],
    trending: [],
    upcoming: []
  });
  const [loading, setLoading] = useState(true);
  const [currentFeatured, setCurrentFeatured] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const homepageData = await mockAnimeService.getHomepageData();
      setData(homepageData);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error loading homepage data:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextFeatured = () => {
    setCurrentFeatured((prev) => 
      prev === data.featured.length - 1 ? 0 : prev + 1
    );
  };

  const prevFeatured = () => {
    setCurrentFeatured((prev) => 
      prev === 0 ? data.featured.length - 1 : prev - 1
    );
  };

  const formatScore = (score) => {
    return score ? score.toFixed(1) : 'N/A';
  };

  const formatMembers = (members) => {
    if (members >= 1000000) {
      return `${(members / 1000000).toFixed(1)}M`;
    } else if (members >= 1000) {
      return `${(members / 1000).toFixed(1)}K`;
    }
    return members?.toString() || '0';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Finished Airing': 'bg-green-500',
      'Currently Airing': 'bg-blue-500',
      'Not yet aired': 'bg-yellow-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const currentAnime = data.featured[currentFeatured];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section - Featured Anime */}
      {currentAnime && (
        <section className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={currentAnime.images?.jpg?.large_image_url}
              alt={currentAnime.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
          </div>

          <div className="relative z-10 h-full flex items-center">
            <div className="container mx-auto px-6">
              <div className="max-w-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(currentAnime.status)}`}>
                    {currentAnime.status}
                  </span>
                  <span className="text-gray-300 text-sm">{currentAnime.type}</span>
                  {currentAnime.episodes && (
                    <span className="text-gray-300 text-sm">{currentAnime.episodes} episodios</span>
                  )}
                </div>

                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                  {currentAnime.title}
                </h1>

                <div className="flex items-center space-x-6 mb-6">
                  <div className="flex items-center space-x-2">
                    <Star className="text-yellow-400 fill-current" size={20} />
                    <span className="text-white font-semibold">{formatScore(currentAnime.score)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="text-blue-400" size={20} />
                    <span className="text-gray-300">{formatMembers(currentAnime.members)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-purple-400" size={20} />
                    <span className="text-gray-300">{currentAnime.year}</span>
                  </div>
                </div>

                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  {currentAnime.synopsis}
                </p>

                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors">
                    <Play size={20} />
                    <span>Ver Ahora</span>
                  </button>
                  <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold transition-colors backdrop-blur-sm">
                    <Plus size={20} />
                    <span>Mi Lista</span>
                  </button>
                  <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold transition-colors backdrop-blur-sm">
                    <Heart size={20} />
                    <span>Favorito</span>
                  </button>
                </div>

                {currentAnime.genres && currentAnime.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {currentAnime.genres.map((genre, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation arrows */}
          {data.featured.length > 1 && (
            <>
              <button
                onClick={prevFeatured}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-20"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextFeatured}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-20"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Indicators */}
          {data.featured.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
              {data.featured.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeatured(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentFeatured ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Top Ranked Section */}
      {data.topAnime.length > 0 && (
        <section className="py-12 px-6">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white flex items-center">
                <TrendingUp className="mr-3 text-yellow-400" size={32} />
                Top Ranked
              </h2>
              <button className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
                <span>Ver todos</span>
                <ArrowRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {data.topAnime.map((anime, index) => (
                <div key={anime.mal_id} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg">
                    <img 
                      src={anime.images?.jpg?.large_image_url}
                      alt={anime.title}
                      className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Star className="text-yellow-400 fill-current" size={16} />
                          <span className="text-white font-semibold">{formatScore(anime.score)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="text-blue-400" size={16} />
                          <span className="text-gray-300 text-sm">{formatMembers(anime.members)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 bg-yellow-500 text-black font-bold text-sm px-2 py-1 rounded">
                      #{anime.rank || index + 1}
                    </div>
                  </div>
                  <h3 className="text-white font-semibold mt-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {anime.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Now Section */}
      {data.trending.length > 0 && (
        <section className="py-12 px-6 bg-gray-800/50">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white flex items-center">
                <TrendingUp className="mr-3 text-red-400" size={32} />
                Trending Now
              </h2>
              <button className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
                <span>Ver todos</span>
                <ArrowRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.trending.map((anime) => (
                <div key={anime.mal_id} className="bg-gray-800 rounded-lg overflow-hidden group hover:bg-gray-700 transition-colors cursor-pointer">
                  <div className="flex">
                    <div className="w-24 h-32 flex-shrink-0">
                      <img 
                        src={anime.images?.jpg?.large_image_url}
                        alt={anime.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-white font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                          {anime.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm">
                          {anime.score && (
                            <div className="flex items-center space-x-1">
                              <Star className="text-yellow-400 fill-current" size={14} />
                              <span className="text-gray-300">{formatScore(anime.score)}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Users className="text-blue-400" size={14} />
                            <span className="text-gray-300">{formatMembers(anime.members)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(anime.status)}`}>
                          {anime.status}
                        </span>
                        <div className="flex space-x-2">
                          <button className="p-1 hover:bg-gray-600 rounded transition-colors">
                            <Eye size={16} className="text-gray-400" />
                          </button>
                          <button className="p-1 hover:bg-gray-600 rounded transition-colors">
                            <Bookmark size={16} className="text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Section */}
      {data.upcoming.length > 0 && (
        <section className="py-12 px-6">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white flex items-center">
                <Calendar className="mr-3 text-purple-400" size={32} />
                Próximamente
              </h2>
              <button className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
                <span>Ver todos</span>
                <ArrowRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {data.upcoming.map((anime) => (
                <div key={anime.mal_id} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg">
                    <img 
                      src={anime.images?.jpg?.large_image_url}
                      alt={anime.title}
                      className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center space-x-2">
                          <Users className="text-blue-400" size={16} />
                          <span className="text-gray-300 text-sm">{formatMembers(anime.members)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 bg-purple-500 text-white font-bold text-xs px-2 py-1 rounded">
                      PRONTO
                    </div>
                  </div>
                  <h3 className="text-white font-semibold mt-3 line-clamp-2 group-hover:text-blue-400 transition-colors text-sm">
                    {anime.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="py-12 px-6 bg-gray-800/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <BookOpen size={48} className="mb-4" />
              <h3 className="text-xl font-bold mb-2">Explorar Manga</h3>
              <p className="text-blue-100 mb-4">Descubre miles de manga en alta calidad</p>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                Ir a Manga
              </button>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
              <Search size={48} className="mb-4" />
              <h3 className="text-xl font-bold mb-2">Búsqueda Avanzada</h3>
              <p className="text-green-100 mb-4">Encuentra exactamente lo que buscas</p>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                Buscar
              </button>
            </div>

            <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
              <Users size={48} className="mb-4" />
              <h3 className="text-xl font-bold mb-2">Comunidad</h3>
              <p className="text-orange-100 mb-4">Únete a las discusiones y debates</p>
              <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                Explorar
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;