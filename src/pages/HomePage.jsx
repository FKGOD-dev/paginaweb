// pages/Homepage.jsx
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Star, 
  Play, 
  BookOpen, 
  Users, 
  Calendar,
  Award,
  MessageCircle,
  Heart,
  Eye,
  Search,
  Filter,
  Bell,
  Settings
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';

// Import de los componentes que creamos
import LoadingSpinner, { CardSkeleton, SearchLoadingSpinner } from '../components/ui/LoadingSpinner';
import CharacterCard, { CompactCharacterCard } from '../components/cards/CharacterCard';
import Pagination, { PaginationInfo, usePagination } from '../components/ui/Pagination';
import GamificationPanel, { useGamification, XPNotification } from '../components/gamification/GamificationPanel';
import RankingSystem from '../components/rankings/RankingSystem';
import AuthSystem from '../components/auth/AuthSystem';
import MangaReader from '../components/reader/MangaReader';
import animeDataService from '../services/animeDataService';

const Homepage = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState('home');
  const [showAuth, setShowAuth] = useState(false);
  const [showReader, setShowReader] = useState(false);
  const [selectedManga, setSelectedManga] = useState(null);
  const [featuredContent, setFeaturedContent] = useState([]);
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [popularManga, setPopularManga] = useState([]);
  const [latestChapters, setLatestChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [xpNotification, setXpNotification] = useState(null);

  // Hooks personalizados
  const { userStats, addXP } = useGamification();
  const { currentPage, totalPages, handlePageChange, resetPage } = usePagination(50, 12);

  // Cargar datos reales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const { trending, topManga } = await animeDataService.getHomepageData();
        const recent = await animeDataService.getLatestChapters(8);

        setTrendingAnime(
          trending.map((anime) => ({
            id: anime.mal_id,
            title: anime.title,
            image: anime.images?.jpg?.image_url,
            rating: anime.score,
            episodes: anime.episodes,
            status: anime.status,
          }))
        );

        setFeaturedContent(
          trending.slice(0, 3).map((anime) => ({
            id: anime.mal_id,
            title: anime.title,
            type: 'anime',
            image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
            description: anime.synopsis,
            rating: anime.score,
            year: anime.year,
            status: anime.status,
          }))
        );

        setPopularManga(
          topManga.map((manga) => ({
            id: manga.mal_id,
            title: manga.title,
            image: manga.images?.jpg?.image_url,
            rating: manga.score,
            chapters: manga.chapters,
            status: manga.status,
          }))
        );

        setLatestChapters(
          recent.map((manga) => ({
            id: manga.mal_id,
            mangaTitle: manga.title,
            image: manga.images?.jpg?.image_url,
            chapterNumber: manga.chapters || 0,
            chapterTitle: manga.title,
            pages: manga.volumes ? manga.volumes * 20 : 0,
            releaseTime: manga.published?.string || ''
          }))
        );
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Simular usuario logueado
  useEffect(() => {
    // Simular que el usuario se loguea después de un momento
    setTimeout(() => {
      setUser({
        id: 1,
        username: 'OtakuMaster2024',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
        level: userStats.level,
        xp: userStats.totalXP
      });
    }, 2000);
  }, []);

  const handleReadManga = (manga) => {
    setSelectedManga(manga);
    setShowReader(true);
    // Ganar XP por leer
    const xpGained = addXP('READ_CHAPTER');
    setXpNotification({ xp: xpGained, action: 'Leer capítulo' });
  };

  const handleLike = (item) => {
    const xpGained = addXP('LIKE_CONTENT');
    setXpNotification({ xp: xpGained, action: 'Like a contenido' });
  };

  if (loading) {
    return <SearchLoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AnimeVerse</h1>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar anime, manga, personajes..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* User area */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <Bell className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="hidden md:block">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Nivel {user.level}</p>
                    </div>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex border-b-0">
              <TabsTrigger value="home" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Inicio
              </TabsTrigger>
              <TabsTrigger value="anime" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Anime
              </TabsTrigger>
              <TabsTrigger value="manga" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Manga
              </TabsTrigger>
              <TabsTrigger value="ranking" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Ranking
              </TabsTrigger>
              <TabsTrigger value="community" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Comunidad
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Home Tab */}
          <TabsContent value="home" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main content area */}
              <div className="lg:col-span-3 space-y-8">
                {/* Featured Carousel */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Destacados</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {featuredContent.map((item) => (
                      <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-64 object-cover"
                          />
                          <div className="absolute top-2 left-2">
                            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                              {item.type}
                            </span>
                          </div>
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={() => handleLike(item)}
                              className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                            >
                              <Heart className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm font-medium">{item.rating}</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{item.year}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Latest Chapters */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Últimos Capítulos</h2>
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                      Ver todos →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {latestChapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleReadManga(chapter)}
                      >
                        <img
                          src={chapter.image}
                          alt={chapter.mangaTitle}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-3">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">
                            {chapter.mangaTitle}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            Cap. {chapter.chapterNumber}: {chapter.chapterTitle}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">{chapter.releaseTime}</span>
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                              {chapter.pages}p
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Trending Anime */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Anime en Tendencia</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {trendingAnime.slice((currentPage - 1) * 6, currentPage * 6).map((anime) => (
                      <div key={anime.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                        <img
                          src={anime.image}
                          alt={anime.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-3">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">
                            {anime.title}
                          </h4>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span>{anime.rating}</span>
                            </div>
                            <span className="text-gray-500 dark:text-gray-400">{anime.episodes} eps</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(trendingAnime.length / 6)}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Gamification Panel */}
                {user && <GamificationPanel />}

                {/* Popular Manga */}
                <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Manga Popular</h3>
                  <div className="space-y-3">
                    {popularManga.slice(0, 5).map((manga, index) => (
                      <div key={manga.id} className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400 w-6">{index + 1}</span>
                        <img
                          src={manga.image}
                          alt={manga.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {manga.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span>{manga.rating}</span>
                            <span>•</span>
                            <span>{manga.chapters} caps</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Community Activity */}
                <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Actividad Reciente</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <div className="flex-1 text-sm">
                        <span className="font-medium">Nueva review</span> de One Piece
                        <p className="text-xs text-gray-500 dark:text-gray-400">hace 5 min</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-red-500" />
                      <div className="flex-1 text-sm">
                        <span className="font-medium">Nuevo favorito</span> añadido
                        <p className="text-xs text-gray-500 dark:text-gray-400">hace 15 min</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <div className="flex-1 text-sm">
                        <span className="font-medium">Logro desbloqueado</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">hace 1h</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </TabsContent>

          {/* Ranking Tab */}
          <TabsContent value="ranking">
            <RankingSystem />
          </TabsContent>

          {/* Otros tabs pueden ir aquí */}
          <TabsContent value="anime">
            <div className="text-center py-16">
              <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sección de Anime</h3>
              <p className="text-gray-600 dark:text-gray-400">Próximamente: exploración completa de anime</p>
            </div>
          </TabsContent>

          <TabsContent value="manga">
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sección de Manga</h3>
              <p className="text-gray-600 dark:text-gray-400">Próximamente: biblioteca completa de manga</p>
            </div>
          </TabsContent>

          <TabsContent value="community">
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Comunidad</h3>
              <p className="text-gray-600 dark:text-gray-400">Próximamente: foros y debates</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      {showAuth && <AuthSystem onClose={() => setShowAuth(false)} />}
      {showReader && selectedManga && (
        <MangaReader
          mangaId={selectedManga.id}
          chapterId={1}
          onClose={() => setShowReader(false)}
        />
      )}

      {/* XP Notification */}
      {xpNotification && (
        <XPNotification
          xp={xpNotification.xp}
          action={xpNotification.action}
          onClose={() => setXpNotification(null)}
        />
      )}
    </div>
  );
};

export default Homepage;