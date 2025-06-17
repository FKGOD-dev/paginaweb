const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// Middleware de autenticación
const requireAuth = (req, res, next) => {
  req.user = { id: 1, username: 'TestUser', role: 'user' };
  next();
};

const optionalAuth = (req, res, next) => {
  req.user = { id: 1, username: 'TestUser', role: 'user' };
  next();
};

// Validador de datos de lista
const validateListData = (name, description = '') => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'El nombre de la lista es requerido' };
  }
  
  if (name.length > 100) {
    return { valid: false, error: 'El nombre no puede exceder 100 caracteres' };
  }
  
  if (description && description.length > 1000) {
    return { valid: false, error: 'La descripción no puede exceder 1000 caracteres' };
  }
  
  return { valid: true };
};

// GET /api/lists - Obtener listas del usuario actual
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const sort = req.query.sort || 'recent'; // recent, popular, alphabetical
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {
      userId: req.user.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // Configurar ordenamiento
    let orderBy = {};
    switch (sort) {
      case 'popular':
        orderBy = { _count: { items: 'desc' } };
        break;
      case 'alphabetical':
        orderBy = { name: 'asc' };
        break;
      default: // recent
        orderBy = { updatedAt: 'desc' };
    }

    const [lists, total] = await Promise.all([
      prisma.userList.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          items: {
            include: {
              manga: {
                select: { id: true, title: true, cover: true, rating: true }
              }
            },
            take: 3 // Primeros 3 items para preview
          },
          _count: {
            select: { items: true, likes: true }
          }
        }
      }),
      prisma.userList.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        lists,
        pagination: {
          current: page,
          total: totalPages,
          limit,
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user lists:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/lists/public - Obtener listas públicas populares
router.get('/public', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const category = req.query.category || ''; // recommendation, collection, ranking
    const skip = (page - 1) * limit;

    const where = {
      isPublic: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(category && { category })
    };

    const [lists, total] = await Promise.all([
      prisma.userList.findMany({
        where,
        orderBy: [
          { likes: 'desc' },
          { _count: { items: 'desc' } },
          { updatedAt: 'desc' }
        ],
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, username: true, avatar: true, level: true }
          },
          items: {
            include: {
              manga: {
                select: { id: true, title: true, cover: true, rating: true }
              }
            },
            take: 5
          },
          _count: {
            select: { items: true, likes: true }
          }
        }
      }),
      prisma.userList.count({ where })
    ]);

    // Si hay usuario autenticado, verificar qué listas ha dado like
    let userLikes = [];
    if (req.user) {
      const listIds = lists.map(l => l.id);
      userLikes = await prisma.listLike.findMany({
        where: {
          userId: req.user.id,
          listId: { in: listIds }
        },
        select: { listId: true }
      });
    }

    const listsWithLikes = lists.map(list => ({
      ...list,
      isLiked: userLikes.some(like => like.listId === list.id)
    }));

    res.json({
      success: true,
      data: {
        lists: listsWithLikes,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          limit,
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching public lists:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/lists/:listId - Obtener lista específica
router.get('/:listId', optionalAuth, async (req, res) => {
  try {
    const { listId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const list = await prisma.userList.findUnique({
      where: { id: parseInt(listId) },
      include: {
        user: {
          select: { id: true, username: true, avatar: true, level: true }
        },
        _count: {
          select: { items: true, likes: true }
        }
      }
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        error: 'Lista no encontrada'
      });
    }

    // Verificar permisos de acceso
    const canAccess = list.isPublic || 
                     (req.user && req.user.id === list.userId) || 
                     (req.user && ['admin', 'moderator'].includes(req.user.role));

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        error: 'Lista privada'
      });
    }

    // Obtener items de la lista
    const [items, totalItems] = await Promise.all([
      prisma.listItem.findMany({
        where: { listId: parseInt(listId) },
        orderBy: { order: 'asc' },
        skip,
        take: limit,
        include: {
          manga: {
            select: {
              id: true,
              title: true,
              cover: true,
              author: true,
              rating: true,
              year: true,
              status: true,
              genres: true
            }
          }
        }
      }),
      prisma.listItem.count({
        where: { listId: parseInt(listId) }
      })
    ]);

    // Verificar si el usuario ha dado like (si está autenticado)
    let isLiked = false;
    if (req.user) {
      const like = await prisma.listLike.findFirst({
        where: {
          userId: req.user.id,
          listId: parseInt(listId)
        }
      });
      isLiked = !!like;
    }

    // Incrementar contador de vistas
    await prisma.userList.update({
      where: { id: parseInt(listId) },
      data: { views: { increment: 1 } }
    });

    res.json({
      success: true,
      data: {
        ...list,
        items,
        isLiked,
        pagination: {
          current: page,
          total: Math.ceil(totalItems / limit),
          limit,
          totalItems
        }
      }
    });

  } catch (error) {
    console.error('Error fetching list details:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/lists - Crear nueva lista
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      name,
      description = '',
      category = 'collection',
      isPublic = false,
      tags = []
    } = req.body;

    // Validar datos
    const validation = validateListData(name, description);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Verificar límite de listas por usuario (ejemplo: 50)
    const userListCount = await prisma.userList.count({
      where: { userId: req.user.id }
    });

    if (userListCount >= 50) {
      return res.status(400).json({
        success: false,
        error: 'Has alcanzado el límite máximo de listas (50)'
      });
    }

    const list = await prisma.userList.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        category,
        isPublic,
        tags,
        userId: req.user.id
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        },
        _count: {
          select: { items: true, likes: true }
        }
      }
    });

    // Otorgar XP por crear lista
    await prisma.user.update({
      where: { id: req.user.id },
      data: { experience: { increment: 10 } }
    });

    res.status(201).json({
      success: true,
      data: list,
      message: 'Lista creada exitosamente'
    });

  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// PUT /api/lists/:listId - Actualizar lista
router.put('/:listId', requireAuth, async (req, res) => {
  try {
    const { listId } = req.params;
    const {
      name,
      description,
      category,
      isPublic,
      tags
    } = req.body;

    // Verificar que la lista existe y pertenece al usuario
    const existingList = await prisma.userList.findUnique({
      where: { id: parseInt(listId) }
    });

    if (!existingList) {
      return res.status(404).json({
        success: false,
        error: 'Lista no encontrada'
      });
    }

    if (existingList.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para editar esta lista'
      });
    }

    // Validar datos si se proporcionan
    if (name !== undefined) {
      const validation = validateListData(name, description);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.error
        });
      }
    }

    // Preparar datos de actualización
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (tags !== undefined) updateData.tags = tags;

    const updatedList = await prisma.userList.update({
      where: { id: parseInt(listId) },
      data: updateData,
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        },
        _count: {
          select: { items: true, likes: true }
        }
      }
    });

    res.json({
      success: true,
      data: updatedList,
      message: 'Lista actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// DELETE /api/lists/:listId - Eliminar lista
router.delete('/:listId', requireAuth, async (req, res) => {
  try {
    const { listId } = req.params;

    const list = await prisma.userList.findUnique({
      where: { id: parseInt(listId) }
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        error: 'Lista no encontrada'
      });
    }

    if (list.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para eliminar esta lista'
      });
    }

    // Eliminar lista (esto eliminará automáticamente los items por cascade)
    await prisma.userList.delete({
      where: { id: parseInt(listId) }
    });

    res.json({
      success: true,
      message: 'Lista eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/lists/:listId/items - Agregar manga a lista
router.post('/:listId/items', requireAuth, async (req, res) => {
  try {
    const { listId } = req.params;
    const { mangaId, note = '', rating } = req.body;

    if (!mangaId) {
      return res.status(400).json({
        success: false,
        error: 'ID del manga es requerido'
      });
    }

    // Verificar que la lista existe y pertenece al usuario
    const list = await prisma.userList.findUnique({
      where: { id: parseInt(listId) }
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        error: 'Lista no encontrada'
      });
    }

    if (list.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para modificar esta lista'
      });
    }

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

    // Verificar que el manga no esté ya en la lista
    const existingItem = await prisma.listItem.findFirst({
      where: {
        listId: parseInt(listId),
        mangaId: parseInt(mangaId)
      }
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        error: 'Este manga ya está en la lista'
      });
    }

    // Obtener el siguiente número de orden
    const lastItem = await prisma.listItem.findFirst({
      where: { listId: parseInt(listId) },
      orderBy: { order: 'desc' }
    });

    const nextOrder = lastItem ? lastItem.order + 1 : 1;

    // Crear item
    const item = await prisma.listItem.create({
      data: {
        listId: parseInt(listId),
        mangaId: parseInt(mangaId),
        note: note.trim(),
        rating: rating ? parseFloat(rating) : null,
        order: nextOrder
      },
      include: {
        manga: {
          select: {
            id: true,
            title: true,
            cover: true,
            author: true,
            rating: true,
            year: true
          }
        }
      }
    });

    // Actualizar timestamp de la lista
    await prisma.userList.update({
      where: { id: parseInt(listId) },
      data: { updatedAt: new Date() }
    });

    res.status(201).json({
      success: true,
      data: item,
      message: 'Manga agregado a la lista exitosamente'
    });

  } catch (error) {
    console.error('Error adding item to list:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// DELETE /api/lists/:listId/items/:itemId - Remover manga de lista
router.delete('/:listId/items/:itemId', requireAuth, async (req, res) => {
  try {
    const { listId, itemId } = req.params;

    // Verificar que la lista pertenece al usuario
    const list = await prisma.userList.findUnique({
      where: { id: parseInt(listId) }
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        error: 'Lista no encontrada'
      });
    }

    if (list.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para modificar esta lista'
      });
    }

    // Verificar que el item existe
    const item = await prisma.listItem.findFirst({
      where: {
        id: parseInt(itemId),
        listId: parseInt(listId)
      }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item no encontrado en esta lista'
      });
    }

    // Eliminar item
    await prisma.listItem.delete({
      where: { id: parseInt(itemId) }
    });

    // Reordenar items restantes
    const remainingItems = await prisma.listItem.findMany({
      where: { listId: parseInt(listId) },
      orderBy: { order: 'asc' }
    });

    for (let i = 0; i < remainingItems.length; i++) {
      await prisma.listItem.update({
        where: { id: remainingItems[i].id },
        data: { order: i + 1 }
      });
    }

    // Actualizar timestamp de la lista
    await prisma.userList.update({
      where: { id: parseInt(listId) },
      data: { updatedAt: new Date() }
    });

    res.json({
      success: true,
      message: 'Manga removido de la lista exitosamente'
    });

  } catch (error) {
    console.error('Error removing item from list:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// PUT /api/lists/:listId/items/:itemId - Actualizar item de lista
router.put('/:listId/items/:itemId', requireAuth, async (req, res) => {
  try {
    const { listId, itemId } = req.params;
    const { note, rating, order } = req.body;

    // Verificar permisos
    const list = await prisma.userList.findUnique({
      where: { id: parseInt(listId) }
    });

    if (!list || list.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para modificar esta lista'
      });
    }

    // Preparar datos de actualización
    const updateData = {};
    if (note !== undefined) updateData.note = note.trim();
    if (rating !== undefined) updateData.rating = rating ? parseFloat(rating) : null;
    if (order !== undefined) updateData.order = parseInt(order);

    const updatedItem = await prisma.listItem.update({
      where: { id: parseInt(itemId) },
      data: updateData,
      include: {
        manga: {
          select: {
            id: true,
            title: true,
            cover: true,
            author: true,
            rating: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedItem,
      message: 'Item actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error updating list item:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/lists/:listId/like - Dar/quitar like a lista
router.post('/:listId/like', requireAuth, async (req, res) => {
  try {
    const { listId } = req.params;
    const userId = req.user.id;

    // Verificar que la lista existe y es pública
    const list = await prisma.userList.findUnique({
      where: { id: parseInt(listId) }
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        error: 'Lista no encontrada'
      });
    }

    if (!list.isPublic && list.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'No puedes dar like a una lista privada'
      });
    }

    // Verificar si ya existe el like
    const existingLike = await prisma.listLike.findFirst({
      where: {
        userId: userId,
        listId: parseInt(listId)
      }
    });

    if (existingLike) {
      // Quitar like
      await prisma.listLike.delete({
        where: { id: existingLike.id }
      });

      await prisma.userList.update({
        where: { id: parseInt(listId) },
        data: { likes: { decrement: 1 } }
      });

      res.json({
        success: true,
        isLiked: false,
        message: 'Like removido'
      });
    } else {
      // Agregar like
      await prisma.listLike.create({
        data: {
          userId: userId,
          listId: parseInt(listId)
        }
      });

      await prisma.userList.update({
        where: { id: parseInt(listId) },
        data: { likes: { increment: 1 } }
      });

      // Otorgar XP al creador de la lista (si no es el mismo usuario)
      if (list.userId !== userId) {
        await prisma.user.update({
          where: { id: list.userId },
          data: { experience: { increment: 2 } }
        });
      }

      res.json({
        success: true,
        isLiked: true,
        message: 'Like agregado'
      });
    }

  } catch (error) {
    console.error('Error toggling list like:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// PUT /api/lists/:listId/reorder - Reordenar items de lista
router.put('/:listId/reorder', requireAuth, async (req, res) => {
  try {
    const { listId } = req.params;
    const { itemOrders } = req.body; // Array de { itemId, order }

    if (!Array.isArray(itemOrders)) {
      return res.status(400).json({
        success: false,
        error: 'itemOrders debe ser un array'
      });
    }

    // Verificar permisos
    const list = await prisma.userList.findUnique({
      where: { id: parseInt(listId) }
    });

    if (!list || list.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para modificar esta lista'
      });
    }

    // Actualizar orden de items
    const updatePromises = itemOrders.map(({ itemId, order }) =>
      prisma.listItem.update({
        where: { id: parseInt(itemId) },
        data: { order: parseInt(order) }
      })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Orden de items actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error reordering list items:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;