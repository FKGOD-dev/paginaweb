// src/components/reader/MangaReaderSystem.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  RotateCcw, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize,
  Book,
  List,
  Grid,
  Monitor,
  Smartphone,
  ArrowUp,
  ArrowDown,
  Home,
  Bookmark,
  Heart,
  Share2,
  MessageCircle,
  Flag,
  Download,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  RefreshCw,
  Info,
  X,
  Menu,
  Search,
  Filter,
  Star,
  Clock,
  User
} from 'lucide-react';

const MangaReaderSystem = ({ mangaId, chapterId }) => {
  const [currentChapter, setCurrentChapter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readingMode, setReadingMode] = useState('vertical'); // vertical, horizontal, paged, double
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const readerRef = useRef(null);
  const imageRefs = useRef([]);
  const scrollTimeoutRef = useRef(null);

  // Mock data para el manga y capítulos
  const mockMangaData = {
    id: mangaId,
    title: "One Piece",
    currentChapter: {
      id: chapterId,
      number: 1095,
      title: "El Mundo Que Queremos",
      pages: 19,
      releaseDate: "2024-01-15T00:00:00Z",
      translator: "Team Español",
      quality: "HD"
    },
    chapters: [
      { id: 1095, number: 1095, title: "El Mundo Que Queremos", pages: 19, releaseDate: "2024-01-15" },
      { id: 1094, number: 1094, title: "La Última Batalla", pages: 17, releaseDate: "2024-01-08" },
      { id: 1093, number: 1093, title: "Luffy vs Kaido", pages: 20, releaseDate: "2024-01-01" },
      { id: 1092, number: 1092, title: "El Despertar", pages: 18, releaseDate: "2023-12-25" }
    ]
  };

  const mockPages = Array.from({ length: 19 }, (_, i) => ({
    id: i + 1,
    url: `https://via.placeholder.com/800x1200/1a1a1a/ffffff?text=Página ${i + 1}`,
    width: 800,
    height: 1200
  }));

  useEffect(() => {
    loadChapter();
  }, [chapterId]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch(e.key) {
        case 'ArrowLeft':
        case 'a':
          previousPage();
          break;
        case 'ArrowRight':
        case 'd':
          nextPage();
          break;
        case 'ArrowUp':
        case 'w':
          if (readingMode === 'vertical') {
            scrollUp();
          }
          break;
        case 'ArrowDown':
        case 's':
          if (readingMode === 'vertical') {
            scrollDown();
          }
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'h':
          setShowUI(!showUI);
          break;
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, readingMode, showUI, isFullscreen]);

  const loadChapter = async () => {
    setLoading(true);
    try {
      // Simular carga del capítulo
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentChapter(mockMangaData.currentChapter);
      setPages(mockPages);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextPage = () => {
    if (currentPage < pages.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const scrollUp = () => {
    if (readerRef.current) {
      readerRef.current.scrollBy(0, -window.innerHeight * 0.8);
    }
  };

  const scrollDown = () => {
    if (readerRef.current) {
      readerRef.current.scrollBy(0, window.innerHeight * 0.8);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleZoom = (direction) => {
    const newZoom = direction === 'in' 
      ? Math.min(zoomLevel + 25, 300) 
      : Math.max(zoomLevel - 25, 50);
    setZoomLevel(newZoom);
  };

  const handleScroll = useCallback(() => {
    if (readerRef.current && readingMode === 'vertical') {
      const { scrollTop, scrollHeight, clientHeight } = readerRef.current;
      const progress = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
      setReadingProgress(Math.max(0, Math.min(100, progress)));

      // Auto-hide UI after scrolling
      setShowUI(true);
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setShowUI(false);
      }, 2000);
    }
  }, [readingMode]);

  useEffect(() => {
    const reader = readerRef.current;
    if (reader) {
      reader.addEventListener('scroll', handleScroll);
      return () => reader.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const renderPagedView = () => (
    <div className="flex items-center justify-center h-full">
      <div className="relative max-w-full max-h-full">
        {readingMode === 'double' && currentPage < pages.length ? (
          <div className="flex space-x-2">
            <img 
              src={pages[currentPage - 1].url}
              alt={`Página ${currentPage}`}
              className="max-h-full max-w-[48%] object-contain"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            />
            <img 
              src={pages[currentPage].url}
              alt={`Página ${currentPage + 1}`}
              className="max-h-full max-w-[48%] object-contain"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            />
          </div>
        ) : (
          <img 
            src={pages[currentPage - 1].url}
            alt={`Página ${currentPage}`}
            className="max-h-full max-w-full object-contain"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          />
        )}
      </div>
    </div>
  );

  const renderVerticalView = () => (
    <div className="flex flex-col items-center space-y-2">
      {pages.map((page, index) => (
        <img 
          key={page.id}
          ref={el => imageRefs.current[index] = el}
          src={page.url}
          alt={`Página ${index + 1}`}
          className="max-w-full object-contain"
          style={{ transform: `scale(${zoomLevel / 100})` }}
          loading="lazy"
        />
      ))}
    </div>
  );

  const renderHorizontalView = () => (
    <div className="flex space-x-4 h-full">
      {pages.map((page, index) => (
        <img 
          key={page.id}
          src={page.url}
          alt={`Página ${index + 1}`}
          className="h-full object-contain flex-shrink-0"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        />
      ))}
    </div>
  );

  const renderSettings = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Configuración del Lector</h3>
          <button
            onClick={() => setShowSettings(false)}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Reading Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Modo de Lectura</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'vertical', label: 'Vertical', icon: Monitor },
                { value: 'horizontal', label: 'Horizontal', icon: Smartphone },
                { value: 'paged', label: 'Paginado', icon: Book },
                { value: 'double', label: 'Doble Página', icon: Grid }
              ].map(mode => (
                <button
                  key={mode.value}
                  onClick={() => setReadingMode(mode.value)}
                  className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                    readingMode === mode.value 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <mode.icon size={20} />
                  <span className="text-sm">{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Level */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Zoom: {zoomLevel}%
            </label>
            <input
              type="range"
              min="50"
              max="300"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Tema</label>
            <div className="flex space-x-3">
              <button
                onClick={() => setDarkMode(true)}
                className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                <Moon size={20} />
                <span>Oscuro</span>
              </button>
              <button
                onClick={() => setDarkMode(false)}
                className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                  !darkMode 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                <Sun size={20} />
                <span>Claro</span>
              </button>
            </div>
          </div>

          {/* Auto Scroll */}
          {readingMode === 'vertical' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-300">Auto Scroll</label>
                <button
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    autoScroll ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    autoScroll ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              {autoScroll && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Velocidad: {scrollSpeed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.5"
                    value={scrollSpeed}
                    onChange={(e) => setScrollSpeed(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Atajos de Teclado</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
            <div>A/← : Página anterior</div>
            <div>D/→ : Página siguiente</div>
            <div>W/↑ : Subir</div>
            <div>S/↓ : Bajar</div>
            <div>F : Pantalla completa</div>
            <div>H : Ocultar UI</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChapterList = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Lista de Capítulos</h3>
          <button
            onClick={() => setShowChapterList(false)}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-96">
          <div className="space-y-2">
            {mockMangaData.chapters.map(chapter => (
              <div
                key={chapter.id}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  chapter.id === currentChapter?.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => {
                  // Navigate to chapter
                  setShowChapterList(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Capítulo {chapter.number}</h4>
                    <p className="text-sm opacity-80">{chapter.title}</p>
                  </div>
                  <div className="text-right text-sm opacity-60">
                    <div>{chapter.pages} páginas</div>
                    <div>{new Date(chapter.releaseDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando capítulo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Top Bar */}
      <div className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${
        showUI ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className={`${darkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-sm border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        } p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.history.back()}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'
                }`}
              >
                <Home size={20} />
              </button>
              
              <div>
                <h1 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {mockMangaData.title}
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Capítulo {currentChapter?.number}: {currentChapter?.title}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowChapterList(true)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'
                }`}
              >
                <List size={20} />
              </button>

              <button
                onClick={() => setShowComments(!showComments)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'
                }`}
              >
                <MessageCircle size={20} />
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'
                }`}
              >
                <Settings size={20} />
              </button>

              <button
                onClick={toggleFullscreen}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'
                }`}
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {readingMode === 'vertical' && (
        <div className={`fixed top-16 left-0 right-0 z-30 transition-transform duration-300 ${
          showUI ? 'translate-y-0' : '-translate-y-full'
        }`}>
          <div className={`h-1 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Reader */}
      <div 
        ref={readerRef}
        className={`pt-16 ${
          readingMode === 'vertical' ? 'overflow-y-auto' : 'overflow-hidden'
        } ${
          readingMode === 'horizontal' ? 'overflow-x-auto' : ''
        }`}
        style={{ height: 'calc(100vh - 4rem)' }}
        onMouseMove={() => setShowUI(true)}
      >
        {readingMode === 'vertical' && renderVerticalView()}
        {readingMode === 'horizontal' && renderHorizontalView()}
        {(readingMode === 'paged' || readingMode === 'double') && renderPagedView()}
      </div>

      {/* Bottom Controls for Paged Mode */}
      {(readingMode === 'paged' || readingMode === 'double') && (
        <div className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
          showUI ? 'translate-y-0' : 'translate-y-full'
        }`}>
          <div className={`${darkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-sm border-t ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          } p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={previousPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                    darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>

                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {readingMode === 'double' && currentPage < pages.length 
                    ? `${currentPage}-${currentPage + 1}` 
                    : currentPage
                  } / {pages.length}
                </span>

                <button
                  onClick={nextPage}
                  disabled={currentPage === pages.length}
                  className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                    darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleZoom('out')}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <ZoomOut size={20} />
                </button>

                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {zoomLevel}%
                </span>

                <button
                  onClick={() => handleZoom('in')}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <ZoomIn size={20} />
                </button>
              </div>
            </div>

            {/* Page Navigation Slider */}
            <div className="mt-4">
              <input
                type="range"
                min="1"
                max={pages.length}
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Side Navigation for Paged Mode */}
      {(readingMode === 'paged' || readingMode === 'double') && (
        <>
          <button
            onClick={previousPage}
            disabled={currentPage === 1}
            className="fixed left-4 top-1/2 transform -translate-y-1/2 z-30 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full disabled:opacity-50 transition-all"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={nextPage}
            disabled={currentPage === pages.length}
            className="fixed right-4 top-1/2 transform -translate-y-1/2 z-30 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full disabled:opacity-50 transition-all"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Settings Modal */}
      {showSettings && renderSettings()}

      {/* Chapter List Modal */}
      {showChapterList && renderChapterList()}

      {/* Comments Sidebar */}
      {showComments && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-gray-800 border-l border-gray-700 z-40 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Comentarios</h3>
              <button
                onClick={() => setShowComments(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="text-center py-8">
              <MessageCircle size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Los comentarios aparecerán aquí</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MangaReaderSystem;