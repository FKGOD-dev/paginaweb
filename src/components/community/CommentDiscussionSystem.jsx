// src/components/community/CommentDiscussionSystem.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  MoreHorizontal, 
  Flag, 
  Share2,
  Award,
  Edit,
  Trash2,
  AlertTriangle,
  Crown,
  Shield,
  Star,
  Clock,
  TrendingUp,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Pin,
  Lock,
  Eye,
  EyeOff,
  Bookmark,
  Heart,
  Zap,
  Gift
} from 'lucide-react';

const CommentDiscussionSystem = ({ contentId, contentType = 'anime', episodeNumber = null }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [sortBy, setSortBy] = useState('best'); // best, new, old, controversial
  const [filterBy, setFilterBy] = useState('all'); // all, spoiler, no_spoiler
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  // Mock data para comentarios
  const mockComments = [
    {
      id: 1,
      user: {
        id: 123,
        username: "AnimeExpert2024",
        avatar: "/api/placeholder/40/40",
        level: 67,
        badges: ['moderator', 'top_contributor'],
        reputation: 15420
      },
      content: "Este episodio fue absolutamente increíble. La animación de WIT Studio superó todas las expectativas, especialmente en las escenas de acción. El desarrollo del personaje de Eren en este arco narrativo es simplemente magistral.",
      timestamp: "2024-01-15T10:30:00Z",
      upvotes: 856,
      downvotes: 23,
      userVote: 1, // 1 = upvote, -1 = downvote, 0 = no vote
      spoiler: false,
      pinned: true,
      edited: true,
      awards: [
        { type: 'gold', count: 3 },
        { type: 'helpful', count: 7 },
        { type: 'wholesome', count: 12 }
      ],
      replies: [
        {
          id: 11,
          user: {
            id: 456,
            username: "MangaReader99",
            avatar: "/api/placeholder/40/40",
            level: 34,
            badges: ['verified'],
            reputation: 8930
          },
          content: "Estoy completamente de acuerdo! Como lector del manga, puedo decir que han adaptado esta parte de manera perfecta. Sin spoilers, pero lo que viene después será aún mejor 👀",
          timestamp: "2024-01-15T11:45:00Z",
          upvotes: 234,
          downvotes: 12,
          userVote: 0,
          spoiler: false,
          parentId: 1,
          replies: [
            {
              id: 111,
              user: {
                id: 789,
                username: "AnimeOnlyFan",
                avatar: "/api/placeholder/40/40",
                level: 12,
                badges: [],
                reputation: 890
              },
              content: "Por favor no hagas comentarios que puedan dar pistas! Algunos preferimos ir ciegos 😅",
              timestamp: "2024-01-15T12:00:00Z",
              upvotes: 45,
              downvotes: 3,
              userVote: 1,
              spoiler: false,
              parentId: 11
            }
          ]
        }
      ]
    },
    {
      id: 2,
      user: {
        id: 234,
        username: "CasualViewer",
        avatar: "/api/placeholder/40/40",
        level: 8,
        badges: [],
        reputation: 234
      },
      content: "SPOILER ALERT: ||No puedo creer que hayan revelado la verdadera identidad del titán bestia! Esto cambia todo lo que sabíamos sobre la historia. Zeke siendo el hermano de Eren era algo que no me esperaba para nada.||",
      timestamp: "2024-01-15T13:20:00Z",
      upvotes: 312,
      downvotes: 89,
      userVote: 0,
      spoiler: true,
      pinned: false,
      replies: []
    },
    {
      id: 3,
      user: {
        id: 345,
        username: "TheoryMaster",
        avatar: "/api/placeholder/40/40",
        level: 45,
        badges: ['theory_king', 'early_supporter'],
        reputation: 12340
      },
      content: "Interesante teoría: creo que los eventos de este episodio confirman mi teoría sobre el origen de los titanes. He estado analizando cada detalle y hay pistas que apuntan a algo mucho más grande de lo que parece.",
      timestamp: "2024-01-15T14:10:00Z",
      upvotes: 178,
      downvotes: 67,
      userVote: -1,
      spoiler: false,
      pinned: false,
      awards: [
        { type: 'theory', count: 5 }
      ],
      replies: []
    }
  ];

  useEffect(() => {
    loadComments();
  }, [contentId, episodeNumber, sortBy, filterBy]);

  const loadComments = async () => {
    setLoading(true);
    try {
      // Simular carga de comentarios
      await new Promise(resolve => setTimeout(resolve, 500));
      setComments(mockComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      user: {
        id: 999,
        username: "CurrentUser",
        avatar: "/api/placeholder/40/40",
        level: 25,
        badges: ['member'],
        reputation: 1250
      },
      content: newComment,
      timestamp: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      userVote: 0,
      spoiler: newComment.includes('||'),
      pinned: false,
      replies: []
    };

    if (replyingTo) {
      // Handle reply logic
      const updateComments = (comments) => {
        return comments.map(c => {
          if (c.id === replyingTo) {
            return {
              ...c,
              replies: [...(c.replies || []), { ...comment, parentId: replyingTo }]
            };
          }
          if (c.replies && c.replies.length > 0) {
            return {
              ...c,
              replies: updateComments(c.replies)
            };
          }
          return c;
        });
      };
      setComments(updateComments(comments));
    } else {
      setComments(prev => [comment, ...prev]);
    }

    setNewComment('');
    setReplyingTo(null);
  };

  const handleVote = (commentId, vote) => {
    const updateVotes = (comments) => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          let newUpvotes = comment.upvotes;
          let newDownvotes = comment.downvotes;
          let newUserVote = vote;

          // Remove previous vote
          if (comment.userVote === 1) {
            newUpvotes--;
          } else if (comment.userVote === -1) {
            newDownvotes--;
          }

          // Add new vote
          if (vote === 1) {
            newUpvotes++;
          } else if (vote === -1) {
            newDownvotes++;
          }

          // If clicking same vote, remove it
          if (comment.userVote === vote) {
            newUserVote = 0;
          }

          return {
            ...comment,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            userVote: newUserVote
          };
        }
        
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateVotes(comment.replies)
          };
        }
        
        return comment;
      });
    };

    setComments(updateVotes(comments));
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    }
  };

  const getBadgeIcon = (badge) => {
    const badges = {
      moderator: { icon: Shield, color: 'text-green-400', label: 'Moderador' },
      top_contributor: { icon: Crown, color: 'text-yellow-400', label: 'Top Contributor' },
      verified: { icon: Star, color: 'text-blue-400', label: 'Verificado' },
      theory_king: { icon: Zap, color: 'text-purple-400', label: 'Rey de Teorías' },
      early_supporter: { icon: Heart, color: 'text-red-400', label: 'Supporter Temprano' },
      member: { icon: null, color: 'text-gray-400', label: 'Miembro' }
    };
    
    return badges[badge] || badges.member;
  };

  const getAwardIcon = (type) => {
    const awards = {
      gold: { icon: Crown, color: 'text-yellow-400' },
      helpful: { icon: ThumbsUp, color: 'text-blue-400' },
      wholesome: { icon: Heart, color: 'text-red-400' },
      theory: { icon: Zap, color: 'text-purple-400' }
    };
    
    return awards[type] || awards.helpful;
  };

  const renderSpoilerText = (text) => {
    if (!text.includes('||')) return text;
    
    const parts = text.split(/(\|\|.*?\|\|)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('||') && part.endsWith('||')) {
        const spoilerText = part.slice(2, -2);
        return (
          <span
            key={index}
            className={`px-1 rounded cursor-pointer transition-colors ${
              showSpoilers 
                ? 'bg-gray-700 text-white' 
                : 'bg-gray-600 text-gray-600 hover:bg-gray-500'
            }`}
            onClick={() => setShowSpoilers(!showSpoilers)}
            title="Click para revelar spoiler"
          >
            {showSpoilers ? spoilerText : '████████'}
          </span>
        );
      }
      return part;
    });
  };

  const renderComment = (comment, level = 0) => {
    const isNested = level > 0;
    
    return (
      <div key={comment.id} className={`${isNested ? 'ml-8 border-l border-gray-700 pl-4' : ''}`}>
        <div className={`bg-gray-800 rounded-lg p-4 ${comment.pinned ? 'border border-yellow-500/30' : ''}`}>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <img 
                src={comment.user.avatar} 
                alt={comment.user.username}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">{comment.user.username}</span>
                
                {/* Badges */}
                {comment.user.badges.map(badge => {
                  const badgeInfo = getBadgeIcon(badge);
                  return badgeInfo.icon ? (
                    <badgeInfo.icon 
                      key={badge}
                      size={14} 
                      className={badgeInfo.color}
                      title={badgeInfo.label}
                    />
                  ) : null;
                })}
                
                <span className="text-gray-400 text-sm">Lvl {comment.user.level}</span>
                <span className="text-gray-500 text-sm">•</span>
                <span className="text-gray-400 text-sm">{formatTimestamp(comment.timestamp)}</span>
                
                {comment.edited && (
                  <>
                    <span className="text-gray-500 text-sm">•</span>
                    <span className="text-gray-400 text-sm">editado</span>
                  </>
                )}
                
                {comment.pinned && (
                  <Pin size={14} className="text-yellow-400" title="Comentario fijado" />
                )}
              </div>
            </div>
            
            <button className="text-gray-400 hover:text-white p-1 rounded">
              <MoreHorizontal size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="mb-4">
            {comment.spoiler && (
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle size={14} className="text-yellow-400" />
                <span className="text-yellow-400 text-sm">Contiene spoilers</span>
                <button
                  onClick={() => setShowSpoilers(!showSpoilers)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  {showSpoilers ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            )}
            
            <p className="text-gray-300 leading-relaxed">
              {renderSpoilerText(comment.content)}
            </p>
          </div>

          {/* Awards */}
          {comment.awards && comment.awards.length > 0 && (
            <div className="flex items-center space-x-3 mb-3">
              {comment.awards.map((award, index) => {
                const awardInfo = getAwardIcon(award.type);
                return (
                  <div key={index} className="flex items-center space-x-1">
                    <awardInfo.icon size={14} className={awardInfo.color} />
                    <span className="text-gray-400 text-sm">{award.count}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleVote(comment.id, 1)}
                  className={`p-1 rounded transition-colors ${
                    comment.userVote === 1 
                      ? 'text-green-400 bg-green-400/10' 
                      : 'text-gray-400 hover:text-green-400'
                  }`}
                >
                  <ThumbsUp size={16} />
                </button>
                <span className={`text-sm font-semibold ${
                  comment.upvotes - comment.downvotes > 0 ? 'text-green-400' : 
                  comment.upvotes - comment.downvotes < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {comment.upvotes - comment.downvotes}
                </span>
                <button
                  onClick={() => handleVote(comment.id, -1)}
                  className={`p-1 rounded transition-colors ${
                    comment.userVote === -1 
                      ? 'text-red-400 bg-red-400/10' 
                      : 'text-gray-400 hover:text-red-400'
                  }`}
                >
                  <ThumbsDown size={16} />
                </button>
              </div>

              <button
                onClick={() => setReplyingTo(comment.id)}
                className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Reply size={16} />
                <span className="text-sm">Responder</span>
              </button>

              <button className="flex items-center space-x-1 text-gray-400 hover:text-purple-400 transition-colors">
                <Award size={16} />
                <span className="text-sm">Premiar</span>
              </button>

              <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors">
                <Share2 size={16} />
                <span className="text-sm">Compartir</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button className="text-gray-400 hover:text-yellow-400 p-1 rounded">
                <Bookmark size={14} />
              </button>
              <button className="text-gray-400 hover:text-red-400 p-1 rounded">
                <Flag size={14} />
              </button>
            </div>
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={`Respondiendo a ${comment.user.username}...`}
                className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
              <div className="flex justify-between items-center mt-3">
                <div className="text-sm text-gray-400">
                  Usa ||texto|| para spoilers
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setNewComment('');
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Responder
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map(reply => renderComment(reply, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white">
            Discusión {episodeNumber ? `- Episodio ${episodeNumber}` : ''}
          </h2>
          <span className="text-gray-400">
            {comments.length} comentarios
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSpoilers(!showSpoilers)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              showSpoilers 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {showSpoilers ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{showSpoilers ? 'Ocultar Spoilers' : 'Mostrar Spoilers'}</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="best">Mejores</option>
              <option value="new">Más nuevos</option>
              <option value="old">Más antiguos</option>
              <option value="controversial">Controversiales</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Filtrar:</span>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="spoiler">Solo Spoilers</option>
              <option value="no_spoiler">Sin Spoilers</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <TrendingUp size={16} />
          <span>Discusión activa</span>
        </div>
      </div>

      {/* New Comment Form */}
      {!replyingTo && (
        <div className="mb-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Agregar comentario</h3>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="¿Qué opinas de este episodio? Recuerda usar ||texto|| para spoilers"
            className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Usa ||texto|| para spoilers</span>
              <span>Sé respetuoso y constructivo</span>
            </div>
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
            >
              Comentar
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando comentarios...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Sé el primero en comentar</h3>
            <p className="text-gray-400">Comparte tu opinión sobre este contenido</p>
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
};

export default CommentDiscussionSystem;