// components/reader/MangaReader.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  MessageCircle, 
  Eye, 
  EyeOff,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  List,
  Bookmark,
  Share2,
  Heart,
  ArrowUp,
  ArrowDown,
  Grid,
  Book,
  Monitor,
  Smartphone,
  X,
  Menu
} from 'lucide-react';

const MangaReader = ({ mangaId, chapterId, onClose }) => {
  // Estados principales
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [readingMode, setReadingMode] = useState('vertical'); // 'vertical', 'horizontal', 'paged'
  const [zoom, setZoom] = useState(100);
  const [showUI, setShowUI] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [autoHideTimer, setAutoHideTimer] = useState(null);

  // Referencias
  const readerRef = useRef(null);
  const pageRefs = useRef([]);

  // Datos mock del manga
  const mangaData = {
    title: "One Piece",
    chapter: {
      number: 1095,
      title: "La Última Esperanza",
      pages: 18
    },
    chapters: Array.from({ length: 20 }, (_, i) => ({
      number: 1095 - i,
      title: `Capítulo ${1095 - i}`,
      pages: Math.floor(Math.random() * 20) + 15,
      readDate: i < 5 ? new Date(Date.now() - i * 24 * 60 * 60 * 1000) : null
    }))
  };

  // Generar páginas mock
  useEffect(() => {
    const generatePages = () => {
      const mockPages = Array.from({ length: mangaData.chapter.pages }, (_, i) => ({
        id: i + 1,
        imageUrl: `https://picsum.photos/800/1200?random=${i + 1}`,
        width: 800,
        height: 1200,
        comments: Math.floor(Math.random() * 10)
      }));
      setPages(mockPages);
      setLoading(false);
    };

    setTimeout(generatePages, 1000);
  }, [chapterId]);

  // Auto-hide UI
  useEffect(() => {
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
    }
    
    if (showUI) {
      const timer = setTimeout(() => {
        setShowUI(false);
      }, 3000);
      setAutoHideTimer(timer);
    }

    return () => {
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
      }
    };
  }, [showUI]);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          handlePreviousPage();
          break;
        case 'ArrowRight':
          handleNextPage();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'c':
          setShowComments(!showComments);
          break;
        case 's':
          setShowSettings(!showSettings);
          break;
        case 'Escape':
          if (fullscreen) {
            setFullscreen(false);
          } else {
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, showComments, showSettings, fullscreen]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pages.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 25, 50));
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const handleMouseMove = () => {
    setShowUI(true);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold mb-2">Cargando capítulo...</h3>
          <p className="text-gray-300">{mangaData.title} - Capítulo {mangaData.chapter.number}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`fixed inset-0 bg-black z-50 ${fullscreen ? 'cursor-none' : ''}`}
      onMouseMove={handleMouseMove}
      ref={readerRef}
    >
      {/* Header */}
      <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-40 transition-all duration-300 ${showUI ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{mangaData.title}</h1>
              <p className="text-gray-300">
                Capítulo {mangaData.chapter.number}: {mangaData.chapter.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChapterList(!showChapterList)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors relative"
            >
              <MessageCircle className="w-5 h-5" />
              {pages[currentPage - 1]?.comments > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pages[currentPage - 1].comments}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="h-full overflow-hidden">
        {readingMode === 'vertical' && (
          <VerticalReader 
            pages={pages} 
            zoom={zoom} 
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
        
        {readingMode === 'horizontal' && (
          <HorizontalReader 
            pages={pages} 
            zoom={zoom} 
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
        
        {readingMode === 'paged' && (
          <PagedReader 
            pages={pages} 
            zoom={zoom} 
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPrevious={handlePreviousPage}
            onNext={handleNextPage}
          />
        )}
      </div>

      {/* Controles de navegación */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-40 transition-all duration-300 ${showUI ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center justify-between text-white">
          {/* Navegación de páginas */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm">Página</span>
              <input
                type="number"
                min="1"
                max={pages.length}
                value={currentPage}
                onChange={(e) => setCurrentPage(Math.max(1, Math.min(pages.length, parseInt(e.target.value) || 1)))}
                className="w-16 px-2 py-1 bg-white/20 border border-white/30 rounded text-center"
              />
              <span className="text-sm">de {pages.length}</span>
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === pages.length}
              className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Controles de zoom */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm w-12 text-center">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-full transition-colors ml-2"
            >
              {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentPage / pages.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Panel de configuración */}
      {showSettings && (
        <SettingsPanel 
          readingMode={readingMode}
          onReadingModeChange={setReadingMode}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Panel de comentarios */}
      {showComments && (
        <CommentsPanel 
          pageNumber={currentPage}
          comments={pages[currentPage - 1]?.comments || 0}
          onClose={() => setShowComments(false)}
        />
      )}

      {/* Lista de capítulos */}
      {showChapterList && (
        <ChapterList 
          chapters={mangaData.chapters}
          currentChapter={mangaData.chapter.number}
          onClose={() => setShowChapterList(false)}
        />
      )}
    </div>
  );
};

// Componente para lectura vertical
const VerticalReader = ({ pages, zoom, currentPage, onPageChange }) => {
  const containerRef = useRef(null);

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    
    // Detectar página actual basada en scroll
    let newCurrentPage = 1;
    let accumulatedHeight = 0;
    
    for (let i = 0; i < pages.length; i++) {
      const pageHeight = (pages[i].height * zoom) / 100;
      if (scrollTop < accumulatedHeight + pageHeight / 2) {
        newCurrentPage = i + 1;
        break;
      }
      accumulatedHeight += pageHeight;
    }
    
    if (newCurrentPage !== currentPage) {
      onPageChange(newCurrentPage);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-y-auto overflow-x-hidden"
      onScroll={handleScroll}
    >
      <div className="flex flex-col items-center py-8">
        {pages.map((page, index) => (
          <div key={page.id} className="mb-4">
            <img
              src={page.imageUrl}
              alt={`Página ${page.id}`}
              className="max-w-full h-auto shadow-lg"
              style={{ 
                width: `${(page.width * zoom) / 100}px`,
                maxWidth: '100vw'
              }}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para lectura horizontal
const HorizontalReader = ({ pages, zoom, currentPage, onPageChange }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const pageWidth = (800 * zoom) / 100;
      containerRef.current.scrollLeft = (currentPage - 1) * pageWidth;
    }
  }, [currentPage, zoom]);

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-x-auto overflow-y-hidden"
    >
      <div className="flex items-center h-full" style={{ width: `${pages.length * ((800 * zoom) / 100)}px` }}>
        {pages.map((page, index) => (
          <div key={page.id} className="flex-shrink-0 h-full flex items-center justify-center">
            <img
              src={page.imageUrl}
              alt={`Página ${page.id}`}
              className="max-h-full w-auto shadow-lg"
              style={{ 
                width: `${(page.width * zoom) / 100}px`,
                maxHeight: '100vh'
              }}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para lectura paginada
const PagedReader = ({ pages, zoom, currentPage, onPageChange, onPrevious, onNext }) => {
  const currentPageData = pages[currentPage - 1];

  if (!currentPageData) return null;

  return (
    <div className="h-full flex items-center justify-center relative">
      {/* Página actual */}
      <img
        src={currentPageData.imageUrl}
        alt={`Página ${currentPageData.id}`}
        className="max-w-full max-h-full object-contain shadow-lg"
        style={{ 
          width: `${(currentPageData.width * zoom) / 100}px`,
          maxWidth: '95vw',
          maxHeight: '95vh'
        }}
      />

      {/* Botones de navegación invisibles */}
      <button
        onClick={onPrevious}
        className="absolute left-0 top-0 w-1/3 h-full bg-transparent hover:bg-black/10 transition-colors"
        disabled={currentPage === 1}
      />
      <button
        onClick={onNext}
        className="absolute right-0 top-0 w-1/3 h-full bg-transparent hover:bg-black/10 transition-colors"
        disabled={currentPage === pages.length}
      />
    </div>
  );
};

// Panel de configuración
const SettingsPanel = ({ readingMode, onReadingModeChange, onClose }) => {
  return (
    <div className="absolute right-4 top-20 bg-black/90 backdrop-blur-sm rounded-lg p-6 text-white z-50 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Configuración</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Modo de lectura</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onReadingModeChange('vertical')}
              className={`p-3 rounded-lg border transition-colors ${
                readingMode === 'vertical' 
                  ? 'bg-blue-600 border-blue-500' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <ArrowDown className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Vertical</span>
            </button>
            <button
              onClick={() => onReadingModeChange('horizontal')}
              className={`p-3 rounded-lg border transition-colors ${
                readingMode === 'horizontal' 
                  ? 'bg-blue-600 border-blue-500' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <ArrowUp className="w-5 h-5 mx-auto mb-1 rotate-90" />
              <span className="text-xs">Horizontal</span>
            </button>
            <button
              onClick={() => onReadingModeChange('paged')}
              className={`p-3 rounded-lg border transition-colors ${
                readingMode === 'paged' 
                  ? 'bg-blue-600 border-blue-500' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <Book className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Paginado</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Atajos de teclado</label>
          <div className="text-xs space-y-1 text-gray-300">
            <div>← → : Cambiar página</div>
            <div>F : Pantalla completa</div>
            <div>C : Comentarios</div>
            <div>S : Configuración</div>
            <div>ESC : Salir</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Panel de comentarios
const CommentsPanel = ({ pageNumber, comments, onClose }) => {
  return (
    <div className="absolute left-4 top-20 bottom-20 w-80 bg-black/90 backdrop-blur-sm rounded-lg text-white z-50 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Comentarios</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-400">Página {pageNumber} • {comments} comentarios</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Comentarios mock */}
        {Array.from({ length: Math.max(1, comments) }, (_, i) => (
          <div key={i} className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
              <span className="text-sm font-medium">Usuario{i + 1}</span>
              <span className="text-xs text-gray-400">hace 2h</span>
            </div>
            <p className="text-sm text-gray-300">
              Este es un comentario de ejemplo para la página {pageNumber}. 
              ¡Qué momento tan épico!
            </p>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Escribe un comentario..."
            className="flex-1 bg-white/10 border border-gray-600 rounded px-3 py-2 text-sm"
          />
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium">
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

// Lista de capítulos
const ChapterList = ({ chapters, currentChapter, onClose }) => {
  return (
    <div className="absolute right-4 top-20 bottom-20 w-80 bg-black/90 backdrop-blur-sm rounded-lg text-white z-50 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Capítulos</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chapters.map((chapter) => (
          <div
            key={chapter.number}
            className={`p-4 border-b border-gray-700/50 hover:bg-white/10 cursor-pointer transition-colors ${
              chapter.number === currentChapter ? 'bg-blue-600/20 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Capítulo {chapter.number}</h4>
                <p className="text-sm text-gray-400">{chapter.title}</p>
                <p className="text-xs text-gray-500">{chapter.pages} páginas</p>
              </div>
              {chapter.readDate && (
                <div className="text-green-400">
                  <Eye className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MangaReader;