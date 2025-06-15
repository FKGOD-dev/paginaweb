const { z } = require('zod');

// Schemas de validación
const createListSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Nombre muy largo'),
  description: z.string().max(1000, 'Descripción muy larga').optional(),
  isPublic: z.boolean().default(true),
  items: z.array(z.object({
    animeId: z.string().optional(),
    mangaId: z.string().optional(),
    order: z.number().int().min(1).optional(),
    notes: z.string().max(500, 'Notas muy largas').optional()
  })).refine(
    (items) => items.every(item => item.animeId || item.mangaId),
    { message: "Cada item debe tener animeId o mangaId" }
  ).optional()
});

const updateListSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(100, 'Nombre muy largo').optional(),
  description: z.string().max(1000, 'Descripción muy larga').optional(),
  isPublic: z.boolean().optional()
});

const addItemSchema = z.object({
  animeId: z.string().optional(),
  mangaId: z.string().optional(),
  order: z.number().int().min(1).optional(),
  notes: z.string().max(500, 'Notas muy largas').optional()
}).refine(
  (data) => data.animeId || data.mangaId,
  { message: "Debe especificar animeId o mangaId" }
);

const updateItemSchema = z.object({
  order: z.number().int().min(1).optional(),
  notes: z.string().max(500, 'Notas muy largas').optional()
});

const searchListsSchema = z.object({
  query: z.string().optional(),
  sortBy: z.enum(['popular', 'recent', 'upvotes', 'name']).default('popular'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
  userId: z.string().optional(),
  hasAnime: z.boolean().optional(),
  hasManga: z.boolean().optional()
});

const voteListSchema = z.object({
  isUpvote: z.boolean()
});

async function listsRoutes(fastify, options) {
  
  // Helper para verificar permisos de lista
  const canEditList = (list, userId, userRole) => {
    return list.userId === userId || ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(userRole);
  };
  
  // Helper para obtener contenido de items
  const populateListItems = async (items) => {
    const populatedItems = [];
    
    for (const item of items) {
      let content = null;
      
      if (item.animeId) {
        content = await fastify.prisma.anime.findUnique({
          where: { id: item.animeId },
          select: {
            id: true,
            title: true,
            titleEnglish: true,
            coverImage: true,
            type: true,
            status: true,
            rating: true,
            episodes: true,
            season: true,
            seasonYear: true
          }
        });
      } else if (item.mangaId) {
        content = await fastify.prisma.manga.findUnique({
          where: { id: item.mangaId },
          select: {
            id: true,
            title: true,
            titleEnglish: true,
            coverImage: true,
            type: true,
            status: true,
            rating: true,
            chapters: true,
            volumes: true
          }
        });
      }
      
      if (content) {
        populatedItems.push({
          id: item.id,
          order: item.order,
          notes: item.notes,
          type: item.animeId ? 'anime' : 'manga',
          content
        });
      }
    }
    
    return populatedItems.sort((a, b) => (a.order || 999) - (b.order || 999));
  };
  
  // 📋 OBTENER LISTAS CON FILTROS
  fastify.get('/', async (request, reply) => {
    try {
      const filters = searchListsSchema.parse(request.query);
      const { page, limit, sortBy, sortOrder, query, userId, hasAnime, hasManga } = filters;
      
      // Construir condiciones de búsqueda
      const where = {
        isPublic: true
      };
      
      if (query) {
        where.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ];
      }
      
      if (userId) {
        where.userId = userId;
      }
      
      // Filtros por tipo de contenido
      if (hasAnime === true) {
        where.items = {
          some: {
            animeId: { not: null }
          }
        };
      }
      
      if (hasManga === true) {
        where.items = {
          some: {
            mangaId: { not: null }
          }
        };
      }
      
      // Configurar ordenamiento
      let orderBy = {};
      switch (sortBy) {
        case 'popular':
          orderBy = [
            { upvotes: 'desc' },
            { createdAt: 'desc' }
          ];
          break;
        case 'recent':
          orderBy = { createdAt: 'desc' };
          break;
        case 'upvotes':
          orderBy = { upvotes: sortOrder };
          break;
        case 'name':
          orderBy = { name: sortOrder };
          break;
      }
      
      // Ejecutar consulta
      const [lists, total] = await Promise.all([
        fastify.prisma.userList.findMany({
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
                level: true
              }
            },
            items: {
              take: 5, // Solo mostrar primeros 5 items en la lista
              orderBy: { order: 'asc' },
              include: {
                anime: {
                  select: {
                    id: true,
                    title: true,
                    coverImage: true,
                    type: true
                  }
                },
                manga: {
                  select: {
                    id: true,
                    title: true,
                    coverImage: true,
                    type: true
                  }
                }
              }
            },
            _count: {
              select: {
                items: true,
                votes: true
              }
            }
          }
        }),
        fastify.prisma.userList.count({ where })
      ]);
      
      // Formatear listas
      const formattedLists = lists.map(list => ({
        id: list.id,
        name: list.name,
        description: list.description,
        upvotes: list.upvotes,
        downvotes: list.downvotes,
        netScore: list.upvotes - list.downvotes,
        user: list.user,
        itemsCount: list._count.items,
        votesCount: list._count.votes,
        previewItems: list.items.map(item => ({
          id: item.id,
          order: item.order,
          content: item.anime || item.manga,
          type: item.anime ? 'anime' : 'manga'
        })),
        createdAt: list.createdAt,
        updatedAt: list.updatedAt
      }));
      
      reply.send({
        lists: formattedLists,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        filters
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
  
  // 📋 OBTENER LISTA POR ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user?.userId;
      
      const list = await fastify.prisma.userList.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              bio: true,
              level: true,
              createdAt: true
            }
          },
          items: {
            orderBy: { order: 'asc' },
            include: {
              anime: {
                select: {
                  id: true,
                  title: true,
                  titleEnglish: true,
                  coverImage: true,
                  type: true,
                  status: true,
                  rating: true,
                  episodes: true,
                  season: true,
                  seasonYear: true
                }
              },
              manga: {
                select: {
                  id: true,
                  title: true,
                  titleEnglish: true,
                  coverImage: true,
                  type: true,
                  status: true,
                  rating: true,
                  chapters: true,
                  volumes: true
                }
              }
            }
          },
          _count: {
            select: {
              votes: true
            }
          }
        }
      });
      
      if (!list) {
        return reply.code(404).send({ error: 'Lista no encontrada' });
      }
      
      // Verificar permisos de acceso
      if (!list.isPublic && list.userId !== userId) {
        return reply.code(403).send({ error: 'No tienes permisos para ver esta lista' });
      }
      
      // Obtener voto del usuario actual
      let userVote = null;
      if (userId) {
        const vote = await fastify.prisma.listVote.findUnique({
          where: {
            userId_listId: {
              userId,
              listId: id
            }
          }
        });
        userVote = vote?.isUpvote || null;
      }
      
      // Formatear items
      const formattedItems = list.items.map(item => ({
        id: item.id,
        order: item.order,
        notes: item.notes,
        type: item.anime ? 'anime' : 'manga',
        content: item.anime || item.manga
      }));
      
      // Obtener otras listas del mismo usuario
      const userOtherLists = await fastify.prisma.userList.findMany({
        where: {
          userId: list.userId,
          id: { not: id },
          isPublic: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          description: true,
          upvotes: true,
          _count: {
            select: {
              items: true
            }
          }
        }
      });
      
      const response = {
        id: list.id,
        name: list.name,
        description: list.description,
        isPublic: list.isPublic,
        upvotes: list.upvotes,
        downvotes: list.downvotes,
        netScore: list.upvotes - list.downvotes,
        user: list.user,
        items: formattedItems,
        itemsCount: formattedItems.length,
        votesCount: list._count.votes,
        userVote,
        userOtherLists,
        permissions: {
          canEdit: canEditList(list, userId, request.user?.role),
          isOwner: list.userId === userId
        },
        createdAt: list.createdAt,
        updatedAt: list.updatedAt
      };
      
      reply.send(response);
      
    } catch (error) {
      throw error;
    }
  });
  
  // ✍️ CREAR LISTA
  fastify.post('/', async (request, reply) => {
    try {
      const userId = request.user.userId;
      const data = createListSchema.parse(request.body);
      
      // Verificar límite de listas por usuario
      const userListCount = await fastify.prisma.userList.count({
        where: { userId }
      });
      
      const MAX_LISTS_PER_USER = 100;
      if (userListCount >= MAX_LISTS_PER_USER) {
        return reply.code(400).send({
          error: `Has alcanzado el límite máximo de ${MAX_LISTS_PER_USER} listas`
        });
      }
      
      // Crear lista
      const list = await fastify.prisma.userList.create({
        data: {
          name: data.name,
          description: data.description,
          isPublic: data.isPublic,
          userId
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      });
      
      // Agregar items si se proporcionaron
      if (data.items && data.items.length > 0) {
        for (let i = 0; i < data.items.length; i++) {
          const item = data.items[i];
          
          // Verificar que el contenido existe
          if (item.animeId) {
            const anime = await fastify.prisma.anime.findUnique({
              where: { id: item.animeId }
            });
            if (!anime) continue;
          }
          
          if (item.mangaId) {
            const manga = await fastify.prisma.manga.findUnique({
              where: { id: item.mangaId }
            });
            if (!manga) continue;
          }
          
          await fastify.prisma.userListItem.create({
            data: {
              listId: list.id,
              animeId: item.animeId,
              mangaId: item.mangaId,
              order: item.order || i + 1,
              notes: item.notes
            }
          });
        }
      }
      
      // Dar XP al usuario
      if (fastify.awardXP) {
        await fastify.awardXP(userId, 10, 'Crear lista');
      }
      
      reply.code(201).send({
        message: 'Lista creada exitosamente',
        list: {
          id: list.id,
          name: list.name,
          description: list.description,
          isPublic: list.isPublic,
          user: list.user,
          createdAt: list.createdAt
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
  
  // ✏️ ACTUALIZAR LISTA
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.userId;
      const userRole = request.user.role;
      const data = updateListSchema.parse(request.body);
      
      const list = await fastify.prisma.userList.findUnique({
        where: { id }
      });
      
      if (!list) {
        return reply.code(404).send({ error: 'Lista no encontrada' });
      }
      
      if (!canEditList(list, userId, userRole)) {
        return reply.code(403).send({ error: 'No tienes permisos para editar esta lista' });
      }
      
      const updatedList = await fastify.prisma.userList.update({
        where: { id },
        data,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      });
      
      reply.send({
        message: 'Lista actualizada exitosamente',
        list: {
          id: updatedList.id,
          name: updatedList.name,
          description: updatedList.description,
          isPublic: updatedList.isPublic,
          updatedAt: updatedList.updatedAt
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
  
  // 🗑️ ELIMINAR LISTA
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.userId;
      const userRole = request.user.role;
      
      const list = await fastify.prisma.userList.findUnique({
        where: { id }
      });
      
      if (!list) {
        return reply.code(404).send({ error: 'Lista no encontrada' });
      }
      
      if (!canEditList(list, userId, userRole)) {
        return reply.code(403).send({ error: 'No tienes permisos para eliminar esta lista' });
      }
      
      await fastify.prisma.userList.delete({
        where: { id }
      });
      
      reply.send({ message: 'Lista eliminada exitosamente' });
      
    } catch (error) {
      throw error;
    }
  });
  
  // ➕ AGREGAR ITEM A LISTA
  fastify.post('/:id/items', async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.userId;
      const userRole = request.user.role;
      const data = addItemSchema.parse(request.body);
      
      const list = await fastify.prisma.userList.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              items: true
            }
          }
        }
      });
      
      if (!list) {
        return reply.code(404).send({ error: 'Lista no encontrada' });
      }
      
      if (!canEditList(list, userId, userRole)) {
        return reply.code(403).send({ error: 'No tienes permisos para editar esta lista' });
      }
      
      // Verificar límite de items por lista
      const MAX_ITEMS_PER_LIST = 200;
      if (list._count.items >= MAX_ITEMS_PER_LIST) {
        return reply.code(400).send({
          error: `La lista ha alcanzado el límite máximo de ${MAX_ITEMS_PER_LIST} items`
        });
      }
      
      // Verificar que el contenido existe
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
      
      // Verificar que no esté duplicado
      const existingItem = await fastify.prisma.userListItem.findFirst({
        where: {
          listId: id,
          OR: [
            { animeId: data.animeId },
            { mangaId: data.mangaId }
          ]
        }
      });
      
      if (existingItem) {
        return reply.code(409).send({ error: 'Este contenido ya está en la lista' });
      }
      
      // Calcular orden si no se proporciona
      const order = data.order || list._count.items + 1;
      
      const item = await fastify.prisma.userListItem.create({
        data: {
          listId: id,
          animeId: data.animeId,
          mangaId: data.mangaId,
          order,
          notes: data.notes
        },
        include: {
          anime: {
            select: {
              id: true,
              title: true,
              coverImage: true,
              type: true
            }
          },
          manga: {
            select: {
              id: true,
              title: true,
              coverImage: true,
              type: true
            }
          }
        }
      });
      
      reply.code(201).send({
        message: 'Item agregado a la lista exitosamente',
        item: {
          id: item.id,
          order: item.order,
          notes: item.notes,
          type: item.anime ? 'anime' : 'manga',
          content: item.anime || item.manga
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
  
  // ✏️ ACTUALIZAR ITEM DE LISTA
  fastify.put('/:listId/items/:itemId', async (request, reply) => {
    try {
      const { listId, itemId } = request.params;
      const userId = request.user.userId;
      const userRole = request.user.role;
      const data = updateItemSchema.parse(request.body);
      
      const list = await fastify.prisma.userList.findUnique({
        where: { id: listId }
      });
      
      if (!list) {
        return reply.code(404).send({ error: 'Lista no encontrada' });
      }
      
      if (!canEditList(list, userId, userRole)) {
        return reply.code(403).send({ error: 'No tienes permisos para editar esta lista' });
      }
      
      const item = await fastify.prisma.userListItem.findFirst({
        where: {
          id: itemId,
          listId
        }
      });
      
      if (!item) {
        return reply.code(404).send({ error: 'Item no encontrado' });
      }
      
      const updatedItem = await fastify.prisma.userListItem.update({
        where: { id: itemId },
        data,
        include: {
          anime: {
            select: {
              id: true,
              title: true,
              coverImage: true,
              type: true
            }
          },
          manga: {
            select: {
              id: true,
              title: true,
              coverImage: true,
              type: true
            }
          }
        }
      });
      
      reply.send({
        message: 'Item actualizado exitosamente',
        item: {
          id: updatedItem.id,
          order: updatedItem.order,
          notes: updatedItem.notes,
          type: updatedItem.anime ? 'anime' : 'manga',
          content: updatedItem.anime || updatedItem.manga
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
  
  // 🗑️ ELIMINAR ITEM DE LISTA
  fastify.delete('/:listId/items/:itemId', async (request, reply) => {
    try {
      const { listId, itemId } = request.params;
      const userId = request.user.userId;
      const userRole = request.user.role;
      
      const list = await fastify.prisma.userList.findUnique({
        where: { id: listId }
      });
      
      if (!list) {
        return reply.code(404).send({ error: 'Lista no encontrada' });
      }
      
      if (!canEditList(list, userId, userRole)) {
        return reply.code(403).send({ error: 'No tienes permisos para editar esta lista' });
      }
      
      const item = await fastify.prisma.userListItem.findFirst({
        where: {
          id: itemId,
          listId
        }
      });
      
      if (!item) {
        return reply.code(404).send({ error: 'Item no encontrado' });
      }
      
      await fastify.prisma.userListItem.delete({
        where: { id: itemId }
      });
      
      reply.send({ message: 'Item eliminado exitosamente' });
      
    } catch (error) {
      throw error;
    }
  });
  
  // 👍👎 VOTAR LISTA
  fastify.post('/:id/vote', async (request, reply) => {
    try {
      const { id } = request.params;
      const userId = request.user.userId;
      const { isUpvote } = voteListSchema.parse(request.body);
      
      const list = await fastify.prisma.userList.findUnique({
        where: { id },
        select: { id: true, userId: true, isPublic: true, name: true }
      });
      
      if (!list) {
        return reply.code(404).send({ error: 'Lista no encontrada' });
      }
      
      if (!list.isPublic) {
        return reply.code(403).send({ error: 'No puedes votar una lista privada' });
      }
      
      if (list.userId === userId) {
        return reply.code(400).send({ error: 'No puedes votar tu propia lista' });
      }
      
      // Verificar voto existente
      const existingVote = await fastify.prisma.listVote.findUnique({
        where: {
          userId_listId: {
            userId,
            listId: id
          }
        }
      });
      
      let voteResult;
      
      if (existingVote) {
        if (existingVote.isUpvote === isUpvote) {
          // Mismo tipo de voto: eliminar
          await fastify.prisma.listVote.delete({
            where: {
              userId_listId: {
                userId,
                listId: id
              }
            }
          });
          
          await fastify.prisma.userList.update({
            where: { id },
            data: {
              [isUpvote ? 'upvotes' : 'downvotes']: {
                decrement: 1
              }
            }
          });
          
          voteResult = null;
        } else {
          // Cambiar tipo de voto
          await fastify.prisma.listVote.update({
            where: {
              userId_listId: {
                userId,
                listId: id
              }
            },
            data: { isUpvote }
          });
          
          await fastify.prisma.userList.update({
            where: { id },
            data: {
              [isUpvote ? 'upvotes' : 'downvotes']: {
                increment: 1
              },
              [isUpvote ? 'downvotes' : 'upvotes']: {
                decrement: 1
              }
            }
          });
          
          voteResult = isUpvote;
        }
      } else {
        // Nuevo voto
        await fastify.prisma.listVote.create({
          data: {
            userId,
            listId: id,
            isUpvote
          }
        });
        
        await fastify.prisma.userList.update({
          where: { id },
          data: {
            [isUpvote ? 'upvotes' : 'downvotes']: {
              increment: 1
            }
          }
        });
        
        voteResult = isUpvote;
      }
      
      // Obtener contadores actualizados
      const updatedList = await fastify.prisma.userList.findUnique({
        where: { id },
        select: {
          upvotes: true,
          downvotes: true
        }
      });
      
      // Dar XP al usuario por votar
      if (fastify.awardXP && voteResult !== null) {
        await fastify.awardXP(userId, 1, 'Votar lista');
      }
      
      // Notificar al autor si es upvote
      if (voteResult === true) {
        await fastify.prisma.notification.create({
          data: {
            userId: list.userId,
            type: 'SYSTEM',
            title: '👍 Nueva valoración positiva',
            message: `Tu lista "${list.name}" recibió un voto positivo`,
            data: {
              type: 'list_upvote',
              listId: id,
              voterUserId: userId
            }
          }
        });
      }
      
      reply.send({
        message: 'Voto registrado',
        vote: voteResult,
        upvotes: updatedList.upvotes,
        downvotes: updatedList.downvotes,
        netScore: updatedList.upvotes - updatedList.downvotes
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
  
  // 🏆 LISTAS POPULARES
  fastify.get('/trending/popular', async (request, reply) => {
    try {
      const { timeframe = 'week', limit = 20 } = request.query;
      
      let dateFilter = {};
      if (timeframe !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (timeframe) {
          case 'day':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        }
        
        if (startDate) {
          dateFilter.createdAt = { gte: startDate };
        }
      }
      
      const popularLists = await fastify.prisma.userList.findMany({
        where: {
          isPublic: true,
          ...dateFilter
        },
        orderBy: [
          { upvotes: 'desc' },
          { createdAt: 'desc' }
        ],
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              level: true
            }
          },
          items: {
            take: 3,
            orderBy: { order: 'asc' },
            include: {
              anime: {
                select: {
                  id: true,
                  title: true,
                  coverImage: true
                }
              },
              manga: {
                select: {
                  id: true,
                  title: true,
                  coverImage: true
                }
              }
            }
          },
          _count: {
            select: {
              items: true,
              votes: true
            }
          }
        }
      });
      
      const formattedLists = popularLists.map(list => ({
        id: list.id,
        name: list.name,
        description: list.description,
        upvotes: list.upvotes,
        downvotes: list.downvotes,
        netScore: list.upvotes - list.downvotes,
        user: list.user,
        itemsCount: list._count.items,
        votesCount: list._count.votes,
        previewItems: list.items.map(item => ({
          content: item.anime || item.manga,
          type: item.anime ? 'anime' : 'manga'
        })),
        createdAt: list.createdAt
      }));
      
      reply.send({
        lists: formattedLists,
        timeframe,
        generatedAt: new Date().toISOString()
      });
      
    } catch (error) {
      throw error;
    }
  });
  
  // 📋 MIS LISTAS
  fastify.get('/my-lists', async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { page = 1, limit = 20 } = request.query;
      
      const [lists, total] = await Promise.all([
        fastify.prisma.userList.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            _count: {
              select: {
                items: true,
                votes: true
              }
            }
          }
        }),
        fastify.prisma.userList.count({ where: { userId } })
      ]);
      
      const formattedLists = lists.map(list => ({
        id: list.id,
        name: list.name,
        description: list.description,
        isPublic: list.isPublic,
        upvotes: list.upvotes,
        downvotes: list.downvotes,
        netScore: list.upvotes - list.downvotes,
        itemsCount: list._count.items,
        votesCount: list._count.votes,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt
      }));
      
      reply.send({
        lists: formattedLists,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
      
    } catch (error) {
      throw error;
    }
  });
}

module.exports = listsRoutes;