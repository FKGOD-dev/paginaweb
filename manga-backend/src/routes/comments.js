const { z } = require('zod');

// Schemas de validación
const createCommentSchema = z.object({
  content: z.string().min(1, 'Contenido requerido').max(5000, 'Comentario muy largo'),
  animeId: z.string().optional(),
  mangaId: z.string().optional(),
  chapterId: z.string().optional(),
  episodeId: z.string().optional(),
  parentId: z.string().optional(),
  isSpoiler: z.boolean().default(false)
}).refine(
  (data) => {
    // Debe tener al menos un ID de contexto
    return data.animeId || data.mangaId || data.chapterId || data.episodeId;
  },
  {
    message: "Debe especificar un contexto (anime, manga, capítulo o episodio)"
  }
);

const updateCommentSchema = z.object({
  content: z.string().min(1, 'Contenido requerido').max(5000, 'Comentario muy largo'),
  isSpoiler: z.boolean().optional()
});

const voteCommentSchema = z.object({
  isUpvote: z.boolean()
});

const getCommentsSchema = z.object({
  animeId: z.string().optional(),
  mangaId: z.string().optional(),
  chapterId: z.string().optional(),
  episodeId: z.string().optional(),
  sortBy: z.enum(['hot', 'new', 'top', 'controversial']).default('hot'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
  parentId: z.string().optional() // Para obtener respuestas de un comentario específico
});

async function commentsRoutes(fastify, options) {
  
  // Helper para calcular el "hot score" (algoritmo similar a Reddit)
  const calculateHotScore = (upvotes, downvotes, createdAt) => {
    const score = upvotes - downvotes;
    const order = Math.log10(Math.max(Math.abs(score), 1));
    const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
    const seconds = (new Date(createdAt).getTime() / 1000) - 1134028003; // Epoch de Reddit
    
    return sign * order + seconds / 45000;
  };
  
  // Helper para verificar permisos de moderación
  const canModerate = (userRole) => {
    return ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(userRole);
  };
  
  // 💬 OBTENER COMENTARIOS
  fastify.get('/', async (request, reply) => {
    try {
      const filters = getCommentsSchema.parse(request.query);
      const { page, limit, sortBy, parentId, ...contextFilters } = filters;
      const userId = request.user?.userId;
      
      // Construir condiciones de búsqueda
      const where = {
        isHidden: false // No mostrar comentarios ocultos por defecto
      };
      
      // Filtros de contexto
      if (contextFilters.animeId) where.animeId = contextFilters.animeId;
      if (contextFilters.mangaId) where.mangaId = contextFilters.mangaId;
      if (contextFilters.chapterId) where.chapterId = contextFilters.chapterId;
      if (contextFilters.episodeId) where.episodeId = contextFilters.episodeId;
      
      // Si se buscan respuestas de un comentario específico
      if (parentId) {
        where.parentId = parentId;
      } else {
        // Solo comentarios principales (no respuestas)
        where.parentId = null;
      }
      
      // Configurar ordenamiento
      let orderBy = {};
      switch (sortBy) {
        case 'new':
          orderBy = { createdAt: 'desc' };
          break;
        case 'top':
          orderBy = { upvotes: 'desc' };
          break;
        case 'controversial':
          // Comentarios con más votos totales pero ratio similar
          orderBy = [
            { upvotes: 'desc' },
            { downvotes: 'desc' }
          ];
          break;
        case 'hot':
        default:
          orderBy = { createdAt: 'desc' }; // Por ahora, calculamos hot score después
          break;
      }
      
      // Obtener comentarios
      const [comments, total] = await Promise.all([
        fastify.prisma.comment.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                level: true,
                role: true
              }
            },
            parent: {
              select: {
                id: true,
                user: {
                  select: {
                    username: true
                  }
                }
              }
            },
            _count: {
              select: {
                replies: true,
                votes: true
              }
            },
            ...(userId ? {
              votes: {
                where: {
                  userId
                },
                select: {
                  isUpvote: true
                }
              }
            } : {})
          }
        }),
        fastify.prisma.comment.count({ where })
      ]);
      
      // Formatear comentarios
      let formattedComments = comments.map(comment => {
        const userVote = userId && comment.votes && comment.votes.length > 0 
          ? comment.votes[0].isUpvote 
          : null;
        
        return {
          id: comment.id,
          content: comment.content,
          isSpoiler: comment.isSpoiler,
          isEdited: comment.isEdited,
          upvotes: comment.upvotes,
          downvotes: comment.downvotes,
          netScore: comment.upvotes - comment.downvotes,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          user: {
            id: comment.user.id,
            username: comment.user.username,
            avatar: comment.user.avatar,
            level: comment.user.level,
            role: comment.user.role
          },
          parentId: comment.parentId,
          parentUser: comment.parent?.user?.username || null,
          repliesCount: comment._count.replies,
          userVote, // true = upvote, false = downvote, null = no vote
          isOwner: userId === comment.user.id,
          canModerate: userId ? canModerate(request.user.role) : false
        };
      });
      
      // Aplicar ordenamiento "hot" si es necesario
      if (sortBy === 'hot') {
        formattedComments = formattedComments
          .map(comment => ({
            ...comment,
            hotScore: calculateHotScore(comment.upvotes, comment.downvotes, comment.createdAt)
          }))
          .sort((a, b) => b.hotScore - a.hotScore);
      }
      
      reply.send({
        comments: formattedComments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        sortBy,
        context: contextFilters
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Parámetros inválidos',
          details: error.errors
        });
      }
      throw error;
    }
  });
  
  // 📝 CREAR COMENTARIO
  fastify.post('/', async (request, reply) => {
    try {
      const data = createCommentSchema.parse(request.body);
      const userId = request.user.userId;
      
      // Verificar que el contexto existe
      if (data.animeId) {
        const anime = await fastify.prisma.anime.findUnique({
          where: { id: data.animeId }
        });
        if (!anime) {
          return reply.code(404).send({ error: 'Anime no encontrado' });
        }
      }
      
      if (data.mangaId) {
        const manga = await fastify.prisma.manga.findUnique({
          where: { id: data.mangaId }
        });
        if (!manga) {
          return reply.code(404).send({ error: 'Manga no encontrado' });
        }
      }
      
      if (data.chapterId) {
        const chapter = await fastify.prisma.chapter.findUnique({
          where: { id: data.chapterId }
        });
        if (!chapter) {
          return reply.code(404).send({ error: 'Capítulo no encontrado' });
        }
      }
      
      if (data.episodeId) {
        const episode = await fastify.prisma.episode.findUnique({
          where: { id: data.episodeId }
        });
        if (!episode) {
          return reply.code(404).send({ error: 'Episodio no encontrado' });
        }
      }
      
      // Verificar que el comentario padre existe (si es una respuesta)
      if (data.parentId) {
        const parentComment = await fastify.prisma.comment.findUnique({
          where: { id: data.parentId }
        });
        if (!parentComment) {
          return reply.code(404).send({ error: 'Comentario padre no encontrado' });
        }
        
        // Verificar que el comentario padre está en el mismo contexto
        const sameContext = 
          parentComment.animeId === data.animeId &&
          parentComment.mangaId === data.mangaId &&
          parentComment.chapterId === data.chapterId &&
          parentComment.episodeId === data.episodeId;
        
        if (!sameContext) {
          return reply.code(400).send({ error: 'El comentario padre debe estar en el mismo contexto' });
        }
      }
      
      // Crear comentario
      const comment = await fastify.prisma.comment.create({
        data: {
          content: data.content,
          userId,
          animeId: data.animeId,
          mangaId: data.mangaId,
          chapterId: data.chapterId,
          episodeId: data.episodeId,
          parentId: data.parentId,
          isSpoiler: data.isSpoiler
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              level: true,
              role: true
            }
          },
          parent: {
            select: {
              id: true,
              user: {
                select: {
                  username: true
                }
              }
            }
          }
        }
      });
      
      // Dar XP al usuario
      const xpReward = data.parentId ? 3 : 5; // Menos XP por respuestas
      await fastify.prisma.user.update({
        where: { id: userId },
        data: {
          xp: {
            increment: xpReward
          }
        }
      });
      
      // Si es una respuesta, notificar al autor del comentario padre
      if (data.parentId && comment.parent) {
        await fastify.prisma.notification.create({
          data: {
            userId: comment.parent.user.id,
            type: 'COMMENT_REPLY',
            title: 'Nueva respuesta',
            message: `${comment.user.username} respondió a tu comentario`,
            data: {
              commentId: comment.id,
              replyId: comment.id,
              username: comment.user.username
            }
          }
        });
      }
      
      const formattedComment = {
        id: comment.id,
        content: comment.content,
        isSpoiler: comment.isSpoiler,
        isEdited: comment.isEdited,
        upvotes: comment.upvotes,
        downvotes: comment.downvotes,
        netScore: comment.upvotes - comment.downvotes,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        user: comment.user,
        parentId: comment.parentId,
        parentUser: comment.parent?.user?.username || null,
        repliesCount: 0,
        userVote: null,
        isOwner: true,
        canModerate: canModerate(request.user.role)
      };
      
      reply.code(201).send({
        message: 'Comentario creado exitosamente',
        comment: formattedComment,
        xpEarned: xpReward
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Datos inválidos',
          details: error.errors
        });
      }
      throw error;
    }
  });
  
  // ✏️ EDITAR COMENTARIO
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const data = updateCommentSchema.parse(request.body);
      const userId = request.user.userId;
      const userRole = request.user.role;
      
      // Buscar comentario
      const comment = await fastify.prisma.comment.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          }
        }
      });
      
      if (!comment) {
        return reply.code(404).send({ error: 'Comentario no encontrado' });
      }
      
      // Verificar permisos (solo el autor o moderadores)
      if (comment.userId !== userId && !canModerate(userRole)) {
        return reply.code(403).send({ error: 'No tienes permisos para editar este comentario' });
      }
      
      // Actualizar comentario
      const updatedComment = await fastify.prisma.comment.update({
        where: { id },
        data: {
          content: data.content,
          isSpoiler: data.isSpoiler !== undefined ? data.isSpoiler : comment.isSpoiler,
          isEdited: true
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              level: true,
              role: true
            }
          },
          _count: {
            select: {
              replies: true
            }
          }
        }
      });
      
      reply.send({
        message: 'Comentario actualizado exitosamente',
        comment: {
          id: updatedComment.id,
          content: updatedComment.content,
          isSpoiler: updatedComment.isSpoiler,
          isEdited: updatedComment.isEdited,
          upvotes: updatedComment.upvotes,
          downvotes: updatedComment.downvotes,
          netScore: updatedComment.upvotes - updatedComment.downvotes,
          createdAt: updatedComment.createdAt,
          updatedAt: updatedComment.updatedAt,
          user: updatedComment.user,
          repliesCount: updatedComment._count.replies,
          isOwner: updatedComment.userId === userId,
          canModerate: canModerate(userRole)
        }
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Datos inválidos',
          details: error.errors
        });
      }
      throw error;
    }
  });
  
  // 🗑️ ELIMINAR COMENTARIO
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.userId;
      const userRole = request.user.role;
      
      // Buscar comentario
      const comment = await fastify.prisma.comment.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              replies: true
            }
          }
        }
      });
      
      if (!comment) {
        return reply.code(404).send({ error: 'Comentario no encontrado' });
      }
      
      // Verificar permisos
      if (comment.userId !== userId && !canModerate(userRole)) {
        return reply.code(403).send({ error: 'No tienes permisos para eliminar este comentario' });
      }
      
      // Si tiene respuestas, solo marcarlo como eliminado
      if (comment._count.replies > 0) {
        await fastify.prisma.comment.update({
          where: { id },
          data: {
            content: '[Comentario eliminado]',
            isHidden: true
          }
        });
        
        reply.send({ message: 'Comentario marcado como eliminado' });
      } else {
        // Si no tiene respuestas, eliminarlo completamente
        await fastify.prisma.comment.delete({
          where: { id }
        });
        
        reply.send({ message: 'Comentario eliminado exitosamente' });
      }
      
    } catch (error) {
      throw error;
    }
  });
  
  // 👍👎 VOTAR COMENTARIO
  fastify.post('/:id/vote', async (request, reply) => {
    try {
      const { id } = request.params;
      const data = voteCommentSchema.parse(request.body);
      const userId = request.user.userId;
      
      // Verificar que el comentario existe
      const comment = await fastify.prisma.comment.findUnique({
        where: { id }
      });
      
      if (!comment) {
        return reply.code(404).send({ error: 'Comentario no encontrado' });
      }
      
      // No puede votar su propio comentario
      if (comment.userId === userId) {
        return reply.code(400).send({ error: 'No puedes votar tu propio comentario' });
      }
      
      // Verificar voto existente
      const existingVote = await fastify.prisma.commentVote.findUnique({
        where: {
          userId_commentId: {
            userId,
            commentId: id
          }
        }
      });
      
      let voteResult;
      
      if (existingVote) {
        if (existingVote.isUpvote === data.isUpvote) {
          // Mismo tipo de voto: eliminar (toggle)
          await fastify.prisma.commentVote.delete({
            where: {
              userId_commentId: {
                userId,
                commentId: id
              }
            }
          });
          
          // Actualizar contadores
          await fastify.prisma.comment.update({
            where: { id },
            data: {
              [data.isUpvote ? 'upvotes' : 'downvotes']: {
                decrement: 1
              }
            }
          });
          
          voteResult = null;
        } else {
          // Cambiar tipo de voto
          await fastify.prisma.commentVote.update({
            where: {
              userId_commentId: {
                userId,
                commentId: id
              }
            },
            data: {
              isUpvote: data.isUpvote
            }
          });
          
          // Actualizar contadores (quitar del anterior, añadir al nuevo)
          await fastify.prisma.comment.update({
            where: { id },
            data: {
              [data.isUpvote ? 'upvotes' : 'downvotes']: {
                increment: 1
              },
              [data.isUpvote ? 'downvotes' : 'upvotes']: {
                decrement: 1
              }
            }
          });
          
          voteResult = data.isUpvote;
        }
      } else {
        // Nuevo voto
        await fastify.prisma.commentVote.create({
          data: {
            userId,
            commentId: id,
            isUpvote: data.isUpvote
          }
        });
        
        // Actualizar contadores
        await fastify.prisma.comment.update({
          where: { id },
          data: {
            [data.isUpvote ? 'upvotes' : 'downvotes']: {
              increment: 1
            }
          }
        });
        
        voteResult = data.isUpvote;
      }
      
      // Obtener comentario actualizado
      const updatedComment = await fastify.prisma.comment.findUnique({
        where: { id },
        select: {
          upvotes: true,
          downvotes: true
        }
      });
      
      reply.send({
        message: 'Voto registrado',
        vote: voteResult, // true = upvote, false = downvote, null = no vote
        upvotes: updatedComment.upvotes,
        downvotes: updatedComment.downvotes,
        netScore: updatedComment.upvotes - updatedComment.downvotes
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Datos inválidos',
          details: error.errors
        });
      }
      throw error;
    }
  });
  
  // 💭 OBTENER RESPUESTAS DE UN COMENTARIO
  fastify.get('/:id/replies', async (request, reply) => {
    try {
      const { id } = request.params;
      const { page = 1, limit = 10, sortBy = 'hot' } = request.query;
      const userId = request.user?.userId;
      
      // Verificar que el comentario padre existe
      const parentComment = await fastify.prisma.comment.findUnique({
        where: { id }
      });
      
      if (!parentComment) {
        return reply.code(404).send({ error: 'Comentario no encontrado' });
      }
      
      // Obtener respuestas con el endpoint existente
      request.query = {
        ...request.query,
        parentId: id
      };
      
      // Reutilizar la lógica del endpoint principal
      return this.getComments(request, reply);
      
    } catch (error) {
      throw error;
    }
  });
  
  // 🚫 REPORTAR COMENTARIO
  fastify.post('/:id/report', async (request, reply) => {
    try {
      const { id } = request.params;
      const { reason } = request.body;
      const userId = request.user.userId;
      
      if (!reason || reason.trim().length === 0) {
        return reply.code(400).send({ error: 'Razón del reporte requerida' });
      }
      
      // Verificar que el comentario existe
      const comment = await fastify.prisma.comment.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              username: true
            }
          }
        }
      });
      
      if (!comment) {
        return reply.code(404).send({ error: 'Comentario no encontrado' });
      }
      
      // Crear notificación para moderadores
      const moderators = await fastify.prisma.user.findMany({
        where: {
          role: {
            in: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN']
          }
        },
        select: {
          id: true
        }
      });
      
      // Enviar notificación a todos los moderadores
      const notifications = moderators.map(mod => ({
        userId: mod.id,
        type: 'SYSTEM',
        title: 'Comentario reportado',
        message: `Usuario reportó comentario de ${comment.user.username}`,
        data: {
          commentId: id,
          reporterId: userId,
          reason: reason.trim()
        }
      }));
      
      await fastify.prisma.notification.createMany({
        data: notifications
      });
      
      reply.send({
        message: 'Comentario reportado exitosamente. Los moderadores revisarán el reporte.'
      });
      
    } catch (error) {
      throw error;
    }
  });
  
  // 🔒 MODERAR COMENTARIO (Solo moderadores)
  fastify.post('/:id/moderate', async (request, reply) => {
    try {
      const { id } = request.params;
      const { action, reason } = request.body; // action: 'hide', 'delete', 'approve'
      const userRole = request.user.role;
      
      if (!canModerate(userRole)) {
        return reply.code(403).send({ error: 'Permisos insuficientes' });
      }
      
      if (!['hide', 'delete', 'approve'].includes(action)) {
        return reply.code(400).send({ error: 'Acción inválida' });
      }
      
      const comment = await fastify.prisma.comment.findUnique({
        where: { id }
      });
      
      if (!comment) {
        return reply.code(404).send({ error: 'Comentario no encontrado' });
      }
      
      switch (action) {
        case 'hide':
          await fastify.prisma.comment.update({
            where: { id },
            data: { isHidden: true }
          });
          break;
          
        case 'delete':
          await fastify.prisma.comment.delete({
            where: { id }
          });
          break;
          
        case 'approve':
          await fastify.prisma.comment.update({
            where: { id },
            data: { isHidden: false }
          });
          break;
      }
      
      reply.send({
        message: `Comentario ${action === 'hide' ? 'ocultado' : action === 'delete' ? 'eliminado' : 'aprobado'} exitosamente`,
        action,
        reason: reason || null
      });
      
    } catch (error) {
      throw error;
    }
  });
}

module.exports = commentsRoutes;