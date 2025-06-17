import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Maximize, 
  Minimize, 
  RotateCcw,
  Home,
  BookOpen,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  SkipBack,
  SkipForward,
  MessageCircle
} from 'lucide-react';

const MangaReader = () => {
  // Estados principales
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Configuraciones del lector
  const [readerSettings, setReaderSettings] = useState({
    readingMode: 'vertical', // vertical, horizontal, webtoon
    fitMode: 'width', // width, height, auto, original
    backgroundColor: '#000000',
    pageGap: 10,
    autoScroll: false,
    scrollSpeed: 2
  });

  // Estados UI
  const [zoom, setZoom] = useState(100);
  const [uiTimeout, setUiTimeout] = useState(null);
  const readerRef = useRef(null);
  const pageRefs = useRef([]);

  // Mock data para demostración
  const mockChapterData = {
    id: 1,
    mangaId: 1,
    number: currentChapter,
    title: `Capítulo ${currentChapter}: El comienzo de una nueva aventura`,
    pages: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      number: i + 1,
      url: `https://images.unsplash.com/photo-${1578662996442 + i}?w=800&h=1200&fit=crop`,
      width: 800,
      height: 1200
    }))
  };

  const mockComments = [
    {
      id: 1,
      page: currentPage,
      user: "OtakuReader",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
      content: "¡Esta página es increíble! El arte ha mejorado mucho.",
      timestamp: "Hace 2 horas"
    },
    {
      id: 2,
      page: currentPage,
      user: "MangaFan",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
      content: "No puedo esperar a ver qué pasa en el siguiente capítulo.",
      timestamp: "Hace 5 horas"
    }
  ];

  // Efectos
  useEffect(() => {
    loadChapter(currentChapter);
  }, [currentChapter]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          previousPage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextPage();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'Escape':
          if (fullscreen) setFullscreen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, fullscreen]);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowUI(true);
      clearTimeout(uiTimeout);
      const timeout = setTimeout(() => setShowUI(false), 3000);
      setUiTimeout(timeout);
    };

    if (fullscreen) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        clearTimeout(uiTimeout);
      };
    }
  }, [fullscreen, uiTimeout]);

  // Funciones principales
  const loadChapter = async (chapterNumber) => {
    setLoading(true);
    try {
      // Simular carga de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPages(mockChapterData.pages);
      setCurrentPage(1);
      
      // Guardar progreso
      saveReadingProgress(chapterNumber, 1);
    } catch (error) {
      console.error('Error loading chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveReadingProgress = (chapter, page) => {
    // Guardar en localStorage o API
    const progress = {
      mangaId: 1,
      chapter,
      page,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('reading_progress_1', JSON.stringify(progress));
  };

  const nextPage = () => {
    if (currentPage < pages.length) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      saveReadingProgress(currentChapter, newPage);
      scrollToPage(newPage);
    } else {
      nextChapter();
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      saveReadingProgress(currentChapter, newPage);
      scrollToPage(newPage);
    } else {
      previousChapter();
    }
  };

  const nextChapter = () => {
    setCurrentChapter(prev => prev + 1);
  };

  const previousChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(prev => prev - 1);
    }
  };

  const scrollToPage = (pageNumber) => {
    const pageElement = pageRefs.current[pageNumber - 1];
    if (pageElement && readerSettings.readingMode === 'vertical') {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const handleSettingChange = (setting, value) => {
    setReaderSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const getPageStyle = () => {
    const baseStyle = {
      marginBottom: `${readerSettings.pageGap}px`,
      transform: `scale(${zoom / 100})`,
      transformOrigin: 'top center'
    };

    switch (readerSettings.fitMode) {
      case 'width':
        return { ...baseStyle, width: '100%', height: 'auto' };
      case 'height':
        return { ...baseStyle, height: '100vh', width: 'auto' };
      case 'original':
        return { ...baseStyle, width: 'auto', height: 'auto' };
      default:
        return { ...baseStyle, maxWidth: '100%', height: 'auto' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
          <div className="text-white text-lg">Cargando capítulo {currentChapter}...</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={readerRef}
      className="min-h-screen transition-all duration-300"
      style={{ backgroundColor: readerSettings.backgroundColor }}
    >
      {/* Header UI */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm transition-all duration-300 ${
        showUI || !fullscreen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <Home className="w-6 h-6" />
              </button>
              <div className="text-white">
                <h1 className="font-semibold">One Piece</h1>
                <p className="text-sm text-gray-300">{mockChapterData.title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-white text-sm">
                {currentPage} / {pages.length}
              </span>
              
              <button
                onClick={() => setShowComments(!showComments)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <Settings className="w-6 h-6" />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {fullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed top-16 right-4 z-50 bg-gray-900 rounded-lg p-6 w-80 max-h-96 overflow-y-auto">
          <h3 className="text-white font-semibold mb-4">Configuración del lector</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Modo de lectura</label>
              <select
                value={readerSettings.readingMode}
                onChange={(e) => handleSettingChange('readingMode', e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
              >
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
                <option value="webtoon">Webtoon</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">Ajuste de página</label>
              <select
                value={readerSettings.fitMode}
                onChange={(e) => handleSettingChange('fitMode', e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
              >
                <option value="width">Ajustar al ancho</option>
                <option value="height">Ajustar a la altura</option>
                <option value="auto">Automático</option>
                <option value="original">Tamaño original</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Zoom: {zoom}%
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                  className="bg-gray-800 text-white p-2 rounded"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={zoom}
                  onChange={(e) => setZoom(parseInt(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 10))}
                  className="bg-gray-800 text-white p-2 rounded"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Espacio entre páginas: {readerSettings.pageGap}px
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={readerSettings.pageGap}
                onChange={(e) => handleSettingChange('pageGap', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">Color de fondo</label>
              <div className="flex gap-2">
                {['#000000', '#1a1a1a', '#2d2d2d', '#ffffff'].map(color => (
                  <button
                    key={color}
                    onClick={() => handleSettingChange('backgroundColor', color)}
                    className={`w-8 h-8 rounded border-2 ${
                      readerSettings.backgroundColor === color ? 'border-blue-500' : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Panel */}
      {showComments && (
        <div className="fixed top-16 left-4 z-50 bg-gray-900 rounded-lg p-4 w-80 max-h-96 overflow-y-auto">
          <h3 className="text-white font-semibold mb-4">Comentarios - Página {currentPage}</h3>
          
          <div className="space-y-3 mb-4">
            {mockComments.map(comment => (
              <div key={comment.id} className="bg-gray-800 rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <img 
                    src={comment.avatar} 
                    alt={comment.user}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-white text-sm font-medium">{comment.user}</span>
                  <span className="text-gray-400 text-xs">{comment.timestamp}</span>
                </div>
                <p className="text-gray-300 text-sm">{comment.content}</p>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-700 pt-3">
            <textarea
              placeholder="Agregar comentario a esta página..."
              className="w-full bg-gray-800 text-white placeholder-gray-400 rounded px-3 py-2 text-sm resize-none"
              rows={2}
            />
            <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm">
              Comentar
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-16">
        {readerSettings.readingMode === 'vertical' ? (
          // Modo vertical
          <div className="container mx-auto px-4">
            {pages.map((page, index) => (
              <div
                key={page.id}
                ref={el => pageRefs.current[index] = el}
                className="flex justify-center"
              >
                <img
                  src={page.url}
                  alt={`Página ${page.number}`}
                  style={getPageStyle()}
                  className="max-w-full"
                  onLoad={() => {
                    // Detectar página visible
                    const observer = new IntersectionObserver(
                      ([entry]) => {
                        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                          setCurrentPage(index + 1);
                          saveReadingProgress(currentChapter, index + 1);
                        }
                      },
                      { threshold: 0.5 }
                    );
                    observer.observe(el);
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          // Modo horizontal
          <div className="flex items-center justify-center h-screen">
            <button
              onClick={previousPage}
              className="absolute left-4 z-40 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="max-w-full max-h-full flex justify-center">
              <img
                src={pages[currentPage - 1]?.url}
                alt={`Página ${currentPage}`}
                style={getPageStyle()}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            <button
              onClick={nextPage}
              className="absolute right-4 z-40 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm transition-all duration-300 ${
        showUI || !fullscreen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={previousChapter}
                disabled={currentChapter <= 1}
                className="text-white hover:text-gray-300 disabled:opacity-50 transition-colors"
              >
                <SkipBack className="w-6 h-6" />
              </button>
              
              <button
                onClick={previousPage}
                disabled={currentPage <= 1 && currentChapter <= 1}
                className="text-white hover:text-gray-300 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 mx-4">
              <div className="bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentPage / pages.length) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={nextPage}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <button
                onClick={nextChapter}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaReader;