const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// Middleware de autenticación (importar del auth.middleware.js)
const requireAuth = (req, res, next) => {
  // Simulación - en producción usar el middleware real
  req.user = { id: 1, username: 'TestUser', role: 'user' };
  next();
};

// Middleware opcional de autenticación
const optionalAuth = (req, res, next) => {
  // Simulación - en producción usar el middleware real
  req.user = { id: 1, username: 'TestUser', role: 'user' };
  next();
};

// Middleware para rate limiting de comentarios
const commentRateLimit = (req, res, next) => {
  // Implementar rate limiting específico para comentarios
  // Por ejemplo: máximo 10 comentarios por minuto por usuario
  next();
};

// Validador de contenido de comentarios
const validateCommentContent = (content) => {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'El comentario no puede estar vacío' };
  }
  
  if (content.length > 5000) {
    return { valid: false, error: 'El comentario no puede exceder 5000 caracteres' };
  }
  
  // Lista de palabras prohibidas básica
  const forbiddenWords = ['spam', 'hate', 'offensive']; // Expandir según necesidades
  const lowerContent = content.toLowerCase();
  
  for (const word of forbiddenWords) {
    if (lowerContent.includes(word)) {
      return { valid: false, error: 'El comentario contiene contenido no permitido' };
    }
  }
  
  return { valid: true };
};

// GET /api/comments/manga/:mangaId - Obtener comentarios de un manga
router.get('/manga/:mangaId', optionalAuth, async (req, res) => {
  try {
    const { mangaId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sort = req.query.sort || 'newest'; // newest, oldest, likes, replies
    const skip = (page - 1) * limit;

    // Verificar que el manga existe
    const manga = await prisma.manga.findUnique({
      where: { id: parseInt(mangaId) }
    });

    if (!manga) {
      return res.status(404).json({
        success: false,
        error: 'Manga no encontrado'
      });
    }

    // Configurar ordenamiento
    let orderBy = {};
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'likes':
        orderBy = { likes: 'desc' };
        break;
      case 'replies':
        orderBy = { _count: { replies: 'desc' } };
        break;
      default: // newest
        orderBy = { createdAt: 'desc' };
    }

    // Obtener comentarios principales (no respuestas)
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          mangaId: parseInt(mangaId),
          parentId: null // Solo comentarios principales
        },
        orderBy,
        skip,
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
          replies: {
            take: 3, // Primeras 3 respuestas
            orderBy: { createdAt: 'asc' },
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
                select: { likes: true }
              }
            }
          },
          _count: {
            select: {
              replies: true,
              likes: true
            }
          }
        }
      }),
      prisma.comment.count({
        where: {
          mangaId: parseInt(mangaId),
          parentId: null
        }
      })
    ]);

    // Si hay usuario autenticado, verificar qué comentarios ha dado like
    let userLikes = [];
    if (req.user) {
      const commentIds = comments.map(c => c.id);
      userLikes = await prisma.commentLike.findMany({
        where: {
          userId: req.user.id,
          commentId: { in: commentIds }
        },
        select: { commentId: true }
      });
    }

    // Agregar información de like del usuario
    const commentsWithLikes = comments.map(comment => ({
      ...comment,
      isLiked: userLikes.some(like => like.commentId === comment.id),
      replies: comment.replies.map(reply => ({
        ...reply,
        isLiked: userLikes.some(like => like.commentId === reply.id)
      }))
    }));

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        comments: commentsWithLikes,
        pagination: {
          current: page,
          total: totalPages,
          limit,
          totalItems: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching manga comments:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/comments/chapter/:chapterId - Obtener comentarios de un capítulo
router.get('/chapter/:chapterId', optionalAuth, async (req, res) => {
  try {
    const { chapterId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageNumber = parseInt(req.query.pageNumber); // Página específica del manga
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Verificar que el capítulo existe
    const chapter = await prisma.chapter.findUnique({
      where: { id: parseInt(chapterId) }
    });

    if (!chapter) {
      return res.status(404).json({
        success: false,
        error: 'Capítulo no encontrado'
      });
    }

    const whereClause = {
      chapterId: parseInt(chapterId),
      parentId: null
    };

    // Si se especifica página del manga, filtrar por ella
    if (pageNumber) {
      whereClause.pageNumber = pageNumber;
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
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
          replies: {
            take: 3,
            orderBy: { createdAt: 'asc' },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                  level: true,
                  role: true
                }
              }
            }
          },
          _count: {
            select: {
              replies: true,
              likes: true
            }
          }
        }
      }),
      prisma.comment.count({ where: whereClause })
    ]);

    // Verificar likes del usuario
    let userLikes = [];
    if (req.user) {
      const commentIds = comments.map(c => c.id);
      userLikes = await prisma.commentLike.findMany({
        where: {
          userId: req.user.id,
          commentId: { in: commentIds }
        },
        select: { commentId: true }
      });
    }

    const commentsWithLikes = comments.map(comment => ({
      ...comment,
      isLiked: userLikes.some(like => like.commentId === comment.id)
    }));

    res.json({
      success: true,
      data: {
        comments: commentsWithLikes,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          limit,
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching chapter comments:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/comments/:commentId/replies - Obtener respuestas de un comentario
router.get('/:commentId/replies', optionalAuth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [replies, total] = await Promise.all([
      prisma.comment.findMany({
        where: { parentId: parseInt(commentId) },
        orderBy: { createdAt: 'asc' },
        skip,
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
          _count: {
            select: { likes: true }
          }
        }
      }),
      prisma.comment.count({
        where: { parentId: parseInt(commentId) }
      })
    ]);

    // Verificar likes del usuario
    let userLikes = [];
    if (req.user) {
      const replyIds = replies.map(r => r.id);
      userLikes = await prisma.commentLike.findMany({
        where: {
          userId: req.user.id,
          commentId: { in: replyIds }
        },
        select: { commentId: true }
      });
    }

    const repliesWithLikes = replies.map(reply => ({
      ...reply,
      isLiked: userLikes.some(like => like.commentId === reply.id)
    }));

    res.json({
      success: true,
      data: {
        replies: repliesWithLikes,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          limit,
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching comment replies:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/comments - Crear nuevo comentario
router.post('/', requireAuth, commentRateLimit, async (req, res) => {
  try {
    const {
      content,
      mangaId,
      chapterId,
      pageNumber,
      parentId,
      spoilerWarning = false
    } = req.body;

    // Validar contenido
    const contentValidation = validateCommentContent(content);
    if (!contentValidation.valid) {
      return res.status(400).json({
        success: false,
        error: contentValidation.error
      });
    }

    // Validar que al menos hay mangaId o chapterId
    if (!mangaId && !chapterId) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere mangaId o chapterId'
      });
    }

    // Si es una respuesta, verificar que el comentario padre existe
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parseInt(parentId) }
      });

      if (!parentComment) {
        return res.status(404).json({
          success: false,
          error: 'Comentario padre no encontrado'
        });
      }
    }

    // Crear comentario
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: req.user.id,
        mangaId: mangaId ? parseInt(mangaId) : null,
        chapterId: chapterId ? parseInt(chapterId) : null,
        pageNumber: pageNumber ? parseInt(pageNumber) : null,
        parentId: parentId ? parseInt(parentId) : null,
        spoilerWarning: spoilerWarning
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
            replies: true,
            likes: true
          }
        }
      }
    });

    // Otorgar XP por comentar
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        experience: { increment: 5 } // 5 XP por comentario
      }
    });

    // Crear notificación si es una respuesta
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parseInt(parentId) },
        include: { user: true }
      });

      if (parentComment && parentComment.userId !== req.user.id) {
        await prisma.notification.create({
          data: {
            userId: parentComment.userId,
            type: 'comment_reply',
            title: 'Nueva respuesta a tu comentario',
            message: `${req.user.username} respondió a tu comentario`,
            data: {
              commentId: comment.id,
              mangaId: comment.mangaId,
              chapterId: comment.chapterId
            }
          }
        });
      }
    }

    res.status(201).json({
      success: true,
      data: {
        ...comment,
        isLiked: false
      },
      message: 'Comentario creado exitosamente'
    });

  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// PUT /api/comments/:commentId - Editar comentario
router.put('/:commentId', requireAuth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    // Validar contenido
    const contentValidation = validateCommentContent(content);
    if (!contentValidation.valid) {
      return res.status(400).json({
        success: false,
        error: contentValidation.error
      });
    }

    // Verificar que el comentario existe y pertenece al usuario
    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
      include: { user: true }
    });

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        error: 'Comentario no encontrado'
      });
    }

    // Verificar permisos (propietario o admin)
    if (existingComment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para editar este comentario'
      });
    }

    // Verificar tiempo límite para edición (24 horas)
    const timeDiff = Date.now() - existingComment.createdAt.getTime();
    const timeLimit = 24 * 60 * 60 * 1000; // 24 horas

    if (timeDiff > timeLimit && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'El tiempo límite para editar ha expirado (24 horas)'
      });
    }

    // Actualizar comentario
    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: {
        content: content.trim(),
        isEdited: true,
        editedAt: new Date()
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
            replies: true,
            likes: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedComment,
      message: 'Comentario actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// DELETE /api/comments/:commentId - Eliminar comentario
router.delete('/:commentId', requireAuth, async (req, res) => {
  try {
    const { commentId } = req.params;

    // Verificar que el comentario existe
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
      include: { user: true }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comentario no encontrado'
      });
    }

    // Verificar permisos (propietario, moderador o admin)
    const canDelete = comment.userId === req.user.id || 
                     ['admin', 'moderator'].includes(req.user.role);

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para eliminar este comentario'
      });
    }

    // Si tiene respuestas, marcar como eliminado en lugar de borrar
    const replyCount = await prisma.comment.count({
      where: { parentId: parseInt(commentId) }
    });

    if (replyCount > 0) {
      await prisma.comment.update({
        where: { id: parseInt(commentId) },
        data: {
          content: '[Comentario eliminado]',
          isDeleted: true,
          deletedAt: new Date()
        }
      });
    } else {
      // Eliminar completamente si no tiene respuestas
      await prisma.comment.delete({
        where: { id: parseInt(commentId) }
      });
    }

    res.json({
      success: true,
      message: 'Comentario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/comments/:commentId/like - Dar/quitar like a comentario
router.post('/:commentId/like', requireAuth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Verificar que el comentario existe
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comentario no encontrado'
      });
    }

    // Verificar si ya existe el like
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: userId,
          commentId: parseInt(commentId)
        }
      }
    });

    if (existingLike) {
      // Quitar like
      await prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId: userId,
            commentId: parseInt(commentId)
          }
        }
      });

      // Decrementar contador
      await prisma.comment.update({
        where: { id: parseInt(commentId) },
        data: { likes: { decrement: 1 } }
      });

      res.json({
        success: true,
        isLiked: false,
        message: 'Like removido'
      });
    } else {
      // Agregar like
      await prisma.commentLike.create({
        data: {
          userId: userId,
          commentId: parseInt(commentId)
        }
      });

      // Incrementar contador
      await prisma.comment.update({
        where: { id: parseInt(commentId) },
        data: { likes: { increment: 1 } }
      });

      // Otorgar XP al autor del comentario (si no es el mismo usuario)
      if (comment.userId !== userId) {
        await prisma.user.update({
          where: { id: comment.userId },
          data: { experience: { increment: 1 } }
        });

        // Crear notificación
        await prisma.notification.create({
          data: {
            userId: comment.userId,
            type: 'comment_like',
            title: 'Like en tu comentario',
            message: `A ${req.user.username} le gustó tu comentario`,
            data: {
              commentId: parseInt(commentId),
              likedBy: req.user.username
            }
          }
        });
      }

      res.json({
        success: true,
        isLiked: true,
        message: 'Like agregado'
      });
    }

  } catch (error) {
    console.error('Error toggling comment like:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/comments/:commentId/report - Reportar comentario
router.post('/:commentId/report', requireAuth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { reason, description = '' } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere especificar la razón del reporte'
      });
    }

    // Verificar que el comentario existe
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) }
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comentario no encontrado'
      });
    }

    // Verificar que no ha reportado este comentario antes
    const existingReport = await prisma.commentReport.findFirst({
      where: {
        commentId: parseInt(commentId),
        reportedBy: req.user.id
      }
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        error: 'Ya has reportado este comentario'
      });
    }

    // Crear reporte
    await prisma.commentReport.create({
      data: {
        commentId: parseInt(commentId),
        reportedBy: req.user.id,
        reason: reason,
        description: description.trim()
      }
    });

    res.json({
      success: true,
      message: 'Reporte enviado exitosamente. Será revisado por moderadores.'
    });

  } catch (error) {
    console.error('Error reporting comment:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/comments/user/:userId - Obtener comentarios de un usuario
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          userId: parseInt(userId),
          isDeleted: false
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          manga: {
            select: { id: true, title: true, cover: true }
          },
          chapter: {
            select: { id: true, title: true, number: true }
          },
          _count: {
            select: {
              replies: true,
              likes: true
            }
          }
        }
      }),
      prisma.comment.count({
        where: {
          userId: parseInt(userId),
          isDeleted: false
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        comments,
        user: {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        },
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          limit,
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user comments:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;