import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  BookOpen, 
  Star, 
  Calendar, 
  User, 
  Eye,
  MessageCircle,
  Share2,
  Plus,
  Play,
  Clock
} from 'lucide-react';

const MangaDetail = () => {
  const id = "1"; // Simulando useParams
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchMangaDetails();
  }, [id]);

  const fetchMangaDetails = async () => {
    try {
      setLoading(true);
      // Simulación de API call
      const mockManga = {
        id: parseInt(id),
        title: "One Piece",
        alternativeTitles: ["ワンピース", "원피스"],
        author: "Eiichiro Oda",
        artist: "Eiichiro Oda",
        synopsis: "Gol D. Roger era conocido como el 'Rey de los Piratas', el ser más fuerte y más infame que había navegado por Grand Line. La captura y ejecución de Roger por parte del Gobierno Mundial trajo un cambio en todo el mundo.",
        cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
        rating: 9.2,
        status: "Ongoing",
        genres: ["Acción", "Aventura", "Comedia", "Drama", "Shounen"],
        year: 1997,
        views: 15420000,
        favorites: 892000,
        totalChapters: 1100,
        lastUpdate: "2025-06-15"
      };

      const mockChapters = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        number: 1100 - i,
        title: `Capítulo ${1100 - i}: Título del capítulo`,
        date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
        views: Math.floor(Math.random() * 50000) + 10000
      }));

      const mockComments = [
        {
          id: 1,
          user: "OtakuMaster",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
          content: "¡Este manga es increíble! La historia nunca deja de sorprender.",
          date: "2025-06-14",
          likes: 15
        },
        {
          id: 2,
          user: "AnimeFan2024",
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
          content: "Oda es un genio de la narrativa. Cada arco supera al anterior.",
          date: "2025-06-13",
          likes: 23
        }
      ];

      setManga(mockManga);
      setChapters(mockChapters);
      setComments(mockComments);
    } catch (error) {
      console.error('Error fetching manga details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFavorites = () => {
    setIsFavorite(!isFavorite);
    // API call to add/remove favorite
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: comments.length + 1,
      user: "Usuario Actual",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      content: newComment,
      date: new Date().toISOString().split('T')[0],
      likes: 0
    };
    
    setComments([comment, ...comments]);
    setNewComment('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Manga no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cover Image */}
            <div className="lg:col-span-1">
              <img
                src={manga.cover}
                alt={manga.title}
                className="w-full max-w-sm mx-auto rounded-lg shadow-2xl"
              />
            </div>

            {/* Manga Info */}
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold mb-2">{manga.title}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {manga.alternativeTitles.map((title, index) => (
                  <span key={index} className="text-gray-400 text-sm">
                    {title}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Star className="w-5 h-5 text-yellow-500 mr-1" />
                    <span className="text-2xl font-bold">{manga.rating}</span>
                  </div>
                  <span className="text-gray-400 text-sm">Rating</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Eye className="w-5 h-5 text-blue-500 mr-1" />
                    <span className="text-2xl font-bold">{(manga.views / 1000000).toFixed(1)}M</span>
                  </div>
                  <span className="text-gray-400 text-sm">Views</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Heart className="w-5 h-5 text-red-500 mr-1" />
                    <span className="text-2xl font-bold">{(manga.favorites / 1000).toFixed(0)}K</span>
                  </div>
                  <span className="text-gray-400 text-sm">Favorites</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <BookOpen className="w-5 h-5 text-green-500 mr-1" />
                    <span className="text-2xl font-bold">{manga.totalChapters}</span>
                  </div>
                  <span className="text-gray-400 text-sm">Chapters</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {manga.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-600 rounded-full text-sm font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  onClick={handleAddToFavorites}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                    isFavorite 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'En Favoritos' : 'Agregar a Favoritos'}
                </button>
                <button
                  onClick={() => console.log(`Navigate to /manga/${id}/read/1`)}
                  className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Empezar a Leer
                </button>
                <button className="flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors">
                  <Share2 className="w-5 h-5 mr-2" />
                  Compartir
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Autor:</span>
                  <span className="ml-2">{manga.author}</span>
                </div>
                <div>
                  <span className="text-gray-400">Artista:</span>
                  <span className="ml-2">{manga.artist}</span>
                </div>
                <div>
                  <span className="text-gray-400">Estado:</span>
                  <span className="ml-2">{manga.status}</span>
                </div>
                <div>
                  <span className="text-gray-400">Año:</span>
                  <span className="ml-2">{manga.year}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="container mx-auto px-4">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8">
            {['info', 'chapters', 'comments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'info' && 'Información'}
                {tab === 'chapters' && 'Capítulos'}
                {tab === 'comments' && 'Comentarios'}
              </button>
            ))}
          </nav>
        </div>

        <div className="py-8">
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="max-w-4xl">
              <h3 className="text-2xl font-bold mb-4">Sinopsis</h3>
              <p className="text-gray-300 leading-relaxed mb-8">{manga.synopsis}</p>
              
              <h3 className="text-2xl font-bold mb-4">Información adicional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Detalles</h4>
                  <div className="space-y-2 text-sm">
                    <div>Última actualización: {manga.lastUpdate}</div>
                    <div>Capítulos totales: {manga.totalChapters}</div>
                    <div>Tipo: Manga</div>
                    <div>Idioma: Español</div>
                  </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Estadísticas</h4>
                  <div className="space-y-2 text-sm">
                    <div>Puntuación: {manga.rating}/10</div>
                    <div>Lectores: {(manga.views / 1000000).toFixed(1)}M</div>
                    <div>En favoritos: {(manga.favorites / 1000).toFixed(0)}K veces</div>
                    <div>Ranking: #1</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chapters Tab */}
          {activeTab === 'chapters' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Capítulos ({chapters.length})</h3>
                <select className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm">
                  <option>Más reciente</option>
                  <option>Más antiguo</option>
                  <option>Por número</option>
                </select>
              </div>
              
              <div className="grid gap-2">
                {chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => console.log(`Navigate to /manga/${id}/read/${chapter.number}`)}
                    className="flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors w-full text-left"
                  >
                    <div>
                      <h4 className="font-medium">{chapter.title}</h4>
                      <div className="text-sm text-gray-400 flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(chapter.date).toLocaleDateString()}
                        <Eye className="w-4 h-4 ml-4 mr-1" />
                        {chapter.views.toLocaleString()} views
                      </div>
                    </div>
                    <div className="text-blue-500">
                      <Play className="w-5 h-5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Comentarios ({comments.length})</h3>
              
              {/* Add Comment */}
              <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe tu comentario..."
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors"
                  >
                    Publicar comentario
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <img
                        src={comment.avatar}
                        alt={comment.user}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{comment.user}</span>
                          <span className="text-gray-400 text-sm">{comment.date}</span>
                        </div>
                        <p className="text-gray-300 mb-2">{comment.content}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <button className="flex items-center gap-1 text-gray-400 hover:text-white">
                            <Heart className="w-4 h-4" />
                            {comment.likes}
                          </button>
                          <button className="text-gray-400 hover:text-white">
                            Responder
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MangaDetail;