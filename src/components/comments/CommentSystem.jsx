// components/comments/CommentSystem.jsx
import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  ChevronUp, 
  ChevronDown, 
  Reply, 
  MoreHorizontal,
  Flag,
  Share2,
  Award,
  Eye,
  EyeOff,
  AlertTriangle,
  Crown,
  Shield,
  Pin,
  Lock,
  Trash2,
  Edit
} from 'lucide-react';

// Datos mock para comentarios
const generateMockComments = () => {
  const users = [
    { id: 1, username: 'NarutoFan2024', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', level: 25, badges: ['Crítico Experto', 'Fan Veterano'] },
    { id: 2, username: 'OnePieceLover', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', level: 18, badges: ['Lector Voraz'] },
    { id: 3, username: 'AnimeGuru', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', level: 42, badges: ['Leyenda', 'Moderador'] },
    { id: 4, username: 'MangaExplorer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', level: 15, badges: ['Novato Activo'] },
    { id: 5, username: 'OtakuMaster', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', level: 33, badges: ['Experto en Teorías'] }
  ];

  const comments = [
    {
      id: 1,
      user: users[0],
      content: "¡Este capítulo fue increíble! La forma en que Oda maneja el desarrollo de personajes siempre me sorprende. La escena entre Luffy y Kaidou fue épica, pero lo que más me impactó fue el momento emocional con Yamato. ¿Alguien más notó las referencias sutiles a arcos anteriores?",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // hace 2 horas
      upvotes: 156,
      downvotes: 8,
      userVote: 1, // 1 para upvote, -1 para downvote, 0 para neutral
      spoiler: false,
      pinned: true,
      replies: [
        {
          id: 2,
          user: users[1],
          content: "Totalmente de acuerdo! Especialmente la referencia a Water 7 cuando mencionaron a Tom. Oda nunca olvida sus propias historias. Y sí, el momento de Yamato me hizo llorar 😭",
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
          upvotes: 89,
          downvotes: 2,
          userVote: 0,
          spoiler: false,
          replies: [
            {
              id: 3,
              user: users[2],
              content: "Como moderador, solo quiero recordar que mantengan las discusiones civiles. Dicho eso, ¡excelente análisis! La continuidad de Oda es realmente impresionante.",
              timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
              upvotes: 45,
              downvotes: 0,
              userVote: 0,
              spoiler: false,
              replies: []
            }
          ]
        },
        {
          id: 4,
          user: users[3],
          content: "¿Alguien más piensa que esto podría conectar con el arc de Elbaf? Hay algunas pistas sutiles...",
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          upvotes: 32,
          downvotes: 5,
          userVote: 0,
          spoiler: true,
          replies: []
        }
      ]
    },
    {
      id: 5,
      user: users[4],
      content: "Teoría: Creo que el próximo capítulo revelará algo importante sobre el One Piece. Las pistas están ahí si prestamos atención a los diálogos de Roger en los flashbacks.",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      upvotes: 234,
      downvotes: 45,
      userVote: -1,
      spoiler: true,
      pinned: false,
      replies: [
        {
          id: 6,
          user: users[1],
          content: "Interesante teoría, pero creo que aún es muy pronto para esa revelación. Oda suele guardar las grandes revelaciones para momentos más climáticos.",
          timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
          upvotes: 67,
          downvotes: 12,
          userVote: 0,
          spoiler: false,
          replies: []
        }
      ]
    }
  ];

  return comments;
};

const CommentSystem = ({ contentId, contentType = 'anime', className = '' }) => {
  const [comments, setComments] = useState([]);
  const [sortBy, setSortBy] = useState('hot'); // 'hot', 'top', 'new', 'controversial'
  const [newComment, setNewComment] = useState('');
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de comentarios
    setTimeout(() => {
      setComments(generateMockComments());
      setLoading(false);
    }, 1000);
  }, [contentId]);

  const handleVote = (commentId, voteType, isReply = false, parentId = null) => {
    setComments(prevComments => {
      return prevComments.map(comment => {
        if (comment.id === commentId && !isReply) {
          const newVote = comment.userVote === voteType ? 0 : voteType;
          const voteDiff = newVote - comment.userVote;
          
          return {
            ...comment,
            userVote: newVote,
            upvotes: voteType === 1 ? comment.upvotes + voteDiff : comment.upvotes,
            downvotes: voteType === -1 ? comment.downvotes - voteDiff : comment.downvotes
          };
        }
        
        if (isReply && comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === commentId) {
                const newVote = reply.userVote === voteType ? 0 : voteType;
                const voteDiff = newVote - reply.userVote;
                
                return {
                  ...reply,
                  userVote: newVote,
                  upvotes: voteType === 1 ? reply.upvotes + voteDiff : reply.upvotes,
                  downvotes: voteType === -1 ? reply.downvotes - voteDiff : reply.downvotes
                };
              }
              return reply;
            })
          };
        }
        
        return comment;
      });
    });
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    // Aquí iría la lógica para enviar el comentario al backend
    console.log('Nuevo comentario:', newComment);
    setNewComment('');
  };

  const handleReply = (commentId, replyContent) => {
    if (!replyContent.trim()) return;
    
    // Aquí iría la lógica para enviar la respuesta
    console.log('Nueva respuesta:', { commentId, replyContent });
    setReplyingTo(null);
  };

  const getSortedComments = () => {
    const sorted = [...comments];
    
    switch (sortBy) {
      case 'hot':
        return sorted.sort((a, b) => {
          const aScore = a.upvotes - a.downvotes + (a.pinned ? 1000 : 0);
          const bScore = b.upvotes - b.downvotes + (b.pinned ? 1000 : 0);
          return bScore - aScore;
        });
      case 'top':
        return sorted.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      case 'new':
        return sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      case 'controversial':
        return sorted.sort((a, b) => {
          const aRatio = Math.min(a.upvotes, a.downvotes) / Math.max(a.upvotes, a.downvotes, 1);
          const bRatio = Math.min(b.upvotes, b.downvotes) / Math.max(b.upvotes, b.downvotes, 1);
          return bRatio - aRatio;
        });
      default:
        return sorted;
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comentarios ({comments.length})
        </h3>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSpoilers(!showSpoilers)}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
              showSpoilers 
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {showSpoilers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Spoilers
          </button>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value="hot">🔥 Populares</option>
            <option value="top">⬆️ Más votados</option>
            <option value="new">🕐 Más recientes</option>
            <option value="controversial">⚡ Controversiales</option>
          </select>
        </div>
      </div>

      {/* Formulario para nuevo comentario */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="¿Qué opinas sobre este contenido? Recuerda marcar los spoilers..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            rows="3"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Usa [spoiler]texto[/spoiler] para ocultar spoilers</span>
            </div>
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Comentar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {getSortedComments().map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            showSpoilers={showSpoilers}
            onVote={handleVote}
            onReply={handleReply}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            editingComment={editingComment}
            setEditingComment={setEditingComment}
          />
        ))}
      </div>
    </div>
  );
};

// Componente individual de comentario
const CommentItem = ({ 
  comment, 
  showSpoilers, 
  onVote, 
  onReply, 
  replyingTo, 
  setReplyingTo,
  editingComment,
  setEditingComment,
  isReply = false,
  parentId = null
}) => {
  const [showReplies, setShowReplies] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `hace ${days}d`;
    if (hours > 0) return `hace ${hours}h`;
    if (minutes > 0) return `hace ${minutes}m`;
    return 'ahora';
  };

  const renderContent = (content) => {
    if (!showSpoilers && comment.spoiler) {
      return (
        <div className="bg-gray-800 text-gray-800 dark:bg-gray-200 dark:text-gray-200 p-3 rounded-lg cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors">
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Contenido con spoilers - Click para mostrar</span>
          </div>
        </div>
      );
    }

    // Procesar spoilers en el texto
    const spoilerRegex = /\[spoiler\](.*?)\[\/spoiler\]/g;
    const parts = content.split(spoilerRegex);
    
    return (
      <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
        {parts.map((part, index) => {
          if (index % 2 === 1) {
            // Es un spoiler
            return (
              <span
                key={index}
                className={`${
                  showSpoilers 
                    ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-1 rounded'
                    : 'bg-gray-800 text-gray-800 dark:bg-gray-200 dark:text-gray-200 px-1 rounded cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-300'
                }`}
                title={showSpoilers ? '' : 'Click para mostrar spoiler'}
              >
                {showSpoilers ? part : '███████'}
              </span>
            );
          }
          return part;
        })}
      </div>
    );
  };

  const handleSubmitReply = () => {
    onReply(comment.id, replyContent);
    setReplyContent('');
  };

  return (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {comment.pinned && !isReply && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-2">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
              <Pin className="w-4 h-4" />
              <span className="font-medium">Comentario destacado por moderadores</span>
            </div>
          </div>
        )}

        <div className="p-4">
          {/* Header del comentario */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <img
                src={comment.user.avatar}
                alt={comment.user.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {comment.user.username}
                  </span>
                  {comment.user.badges.includes('Moderador') && (
                    <Shield className="w-4 h-4 text-green-500" title="Moderador" />
                  )}
                  {comment.user.badges.includes('Leyenda') && (
                    <Crown className="w-4 h-4 text-yellow-500" title="Usuario Leyenda" />
                  )}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Nivel {comment.user.level}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(comment.timestamp)}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {comment.user.badges.slice(0, 2).map((badge, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 w-48 z-10">
                  <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Flag className="w-4 h-4" />
                    Reportar
                  </button>
                  <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Share2 className="w-4 h-4" />
                    Compartir
                  </button>
                  <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Award className="w-4 h-4" />
                    Dar premio
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Contenido del comentario */}
          <div className="mb-4">
            {renderContent(comment.content)}
          </div>

          {/* Acciones del comentario */}
          <div className="flex items-center gap-4">
            {/* Voting */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onVote(comment.id, 1, isReply, parentId)}
                className={`p-1 rounded-full transition-colors ${
                  comment.userVote === 1
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                    : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                }`}
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[2rem] text-center">
                {comment.upvotes - comment.downvotes}
              </span>
              <button
                onClick={() => onVote(comment.id, -1, isReply, parentId)}
                className={`p-1 rounded-full transition-colors ${
                  comment.userVote === -1
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Reply */}
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <Reply className="w-4 h-4" />
              Responder
            </button>

            {/* Share */}
            <button className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <Share2 className="w-4 h-4" />
              Compartir
            </button>

            {/* Award */}
            <button className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
              <Award className="w-4 h-4" />
              Premio
            </button>
          </div>

          {/* Reply form */}
          {replyingTo === comment.id && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Escribe tu respuesta..."
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                rows="2"
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  onClick={() => setReplyingTo(null)}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim()}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Responder
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="w-full px-4 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {showReplies ? '▼' : '▶'} {comment.replies.length} respuesta{comment.replies.length !== 1 ? 's' : ''}
            </button>
            
            {showReplies && (
              <div className="space-y-3 p-4 pt-0">
                {comment.replies.map(reply => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    showSpoilers={showSpoilers}
                    onVote={onVote}
                    onReply={onReply}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    editingComment={editingComment}
                    setEditingComment={setEditingComment}
                    isReply={true}
                    parentId={comment.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSystem;