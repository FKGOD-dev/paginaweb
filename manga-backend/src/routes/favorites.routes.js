const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// Middleware de autenticación
const requireAuth = (req, res, next) => {
  req.user = { id: 1, username: 'TestUser', role: 'user' };
  next();
};

// GET /api/favorites - Obtener favoritos del usuario
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const type = req.query.type || ''; // manga, anime
    const status = req.query.status || ''; // reading, completed, paused, dropped, planning
    const sort = req.query.sort || 'recent'; // recent, alphabetical, rating, year
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {
      userId: req.user.id,
      ...(search && {
        manga: {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { author: { contains: search, mode: 'insensitive' } }
          ]
        }
      }),
      ...(type && { manga: { type } }),
      ...(status && { status })
    };

    // Configurar ordenamiento
    let orderBy = {};
    switch (sort) {
      case 'alphabetical':
        orderBy = { manga: { title: 'asc' } };
        break;
      case 'rating':
        orderBy = { manga: { rating: 'desc' } };
        break;
      case 'year':
        orderBy = { manga: { year: 'desc' } };
        break;
      default: // recent
        orderBy = { createdAt: 'desc' };
    }

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where,
        orderBy,
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
              type: true,
              genres: true,
              totalChapters: true,
              _count: {
                select: { chapters: true }
              }
            }
          },
          readingProgress: {
            select: {
              lastChapterRead: true,
              pageNumber: true,
              status: true,
              updatedAt: true
            }
          }
        }
      }),
      prisma.favorite.count({ where })
    ]);

    // Calcular progreso de lectura
    const favoritesWithProgress = favorites.map(fav => {
      const totalChapters = fav.manga.totalChapters || fav.manga._count.chapters;
      const readChapters = fav.readingProgress?.lastChapterRead || 0;
      const progressPercentage = totalChapters > 0 ? Math.round((readChapters / totalChapters) * 100) : 0;

      return {
        ...fav,
        progressPercentage,
        totalChapters,
        readChapters
      };
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        favorites: favoritesWithProgress,
        pagination: {
          current: page,
          total: totalPages,
          limit,
          totalItems: total
        },
        stats: {
          total,
          byStatus: await getFavoritesByStatus(req.user.id),
          byType: await getFavoritesByType(req.user.id)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/favorites - Agregar a favoritos
router.post('/', requireAuth, async (req, res) => {
  try {
    const { mangaId, status = 'reading' } = req.body;

    if (!mangaId) {
      return res.status(400).json({
        success: false,
        error: 'ID del manga es requerido'
      });
    }

    // Verificar que el manga existe
    const manga = await prisma.manga.findUnique({
      where: { id: parseInt(mangaId) },
      select: { id: true, title: true, cover: true, author: true }
    });

    if (!manga) {
      return res.status(404).json({
        success: false,
        error: 'Manga no encontrado'
      });
    }

    // Verificar que no esté ya en favoritos
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: req.user.id,
        mangaId: parseInt(mangaId)
      }
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        error: 'Este manga ya está en tus favoritos'
      });
    }

    // Crear favorito
    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        mangaId: parseInt(mangaId),
        status
      },
      include: {
        manga: {
          select: {
            id: true,
            title: true,
            cover: true,
            author: true,
            rating: true,
            year: true,
            type: true
          }
        }
      }
    });

    // Incrementar contador de favoritos del manga
    await prisma.manga.update({
      where: { id: parseInt(mangaId) },
      data: { favoriteCount: { increment: 1 } }
    });

    // Otorgar XP por agregar a favoritos
    await prisma.user.update({
      where: { id: req.user.id },
      data: { experience: { increment: 2 } }
    });

    // Crear entrada de progreso de lectura si no existe
    await prisma.readingProgress.upsert({
      where: {
        userId_mangaId: {
          userId: req.user.id,
          mangaId: parseInt(mangaId)
        }
      },
      update: { status },
      create: {
        userId: req.user.id,
        mangaId: parseInt(mangaId),
        status,
        lastChapterRead: 0,
        pageNumber: 1
      }
    });

    res.status(201).json({
      success: true,
      data: favorite,
      message: `${manga.title} agregado a favoritos`
    });

  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// DELETE /api/favorites/:mangaId - Remover de favoritos
router.delete('/:mangaId', requireAuth, async (req, res) => {
  try {
    const { mangaId } = req.params;

    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: req.user.id,
        mangaId: parseInt(mangaId)
      },
      include: {
        manga: { select: { title: true } }
      }
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        error: 'Este manga no está en tus favoritos'
      });
    }

    // Eliminar favorito
    await prisma.favorite.delete({
      where: { id: favorite.id }
    });

    // Decrementar contador de favoritos del manga
    await prisma.manga.update({
      where: { id: parseInt(mangaId) },
      data: { favoriteCount: { decrement: 1 } }
    });

    res.json({
      success: true,
      message: `${favorite.manga.title} removido de favoritos`
    });

  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// PUT /api/favorites/:mangaId - Actualizar estado de favorito
router.put('/:mangaId', requireAuth, async (req, res) => {
  try {
    const { mangaId } = req.params;
    const { status, rating, review, tags = [] } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Estado es requerido'
      });
    }

    const validStatuses = ['reading', 'completed', 'paused', 'dropped', 'planning'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Estado inválido'
      });
    }

    if (rating && (rating < 1 || rating > 10)) {
      return res.status(400).json({
        success: false,
        error: 'Calificación debe estar entre 1 y 10'
      });
    }

    // Verificar que el favorito existe
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: req.user.id,
        mangaId: parseInt(mangaId)
      }
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        error: 'Este manga no está en tus favoritos'
      });
    }

    // Preparar datos de actualización
    const updateData = { status };
    if (rating !== undefined) updateData.rating = rating;
    if (review !== undefined) updateData.review = review.trim();
    if (tags.length > 0) updateData.tags = tags;

    // Actualizar favorito
    const updatedFavorite = await prisma.favorite.update({
      where: { id: favorite.id },
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

    // Actualizar progreso de lectura
    await prisma.readingProgress.update({
      where: {
        userId_mangaId: {
          userId: req.user.id,
          mangaId: parseInt(mangaId)
        }
      },
      data: { status }
    });

    // Si se completó, otorgar XP extra
    if (status === 'completed' && favorite.status !== 'completed') {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { experience: { increment: 15 } }
      });
    }

    res.json({
      success: true,
      data: updatedFavorite,
      message: 'Favorito actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error updating favorite:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/favorites/stats - Estadísticas de favoritos
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [
      totalFavorites,
      byStatus,
      byType,
      byGenre,
      recentlyAdded,
      topRated
    ] = await Promise.all([
      prisma.favorite.count({ where: { userId: req.user.id } }),
      getFavoritesByStatus(req.user.id),
      getFavoritesByType(req.user.id),
      getFavoritesByGenre(req.user.id),
      prisma.favorite.findMany({
        where: { userId: req.user.id },
        include: {
          manga: { select: { title: true, cover: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.favorite.findMany({
        where: {
          userId: req.user.id,
          rating: { not: null }
        },
        include: {
          manga: { select: { title: true, cover: true } }
        },
        orderBy: { rating: 'desc' },
        take: 5
      })
    ]);

    res.json({
      success: true,
      data: {
        totalFavorites,
        byStatus,
        byType,
        byGenre,
        recentlyAdded,
        topRated
      }
    });

  } catch (error) {
    console.error('Error fetching favorites stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/favorites/recommendations - Recomendaciones basadas en favoritos
router.get('/recommendations', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Obtener géneros favoritos del usuario
    const userFavorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        manga: { select: { genres: true, author: true } }
      }
    });

    if (userFavorites.length === 0) {
      return res.json({
        success: true,
        data: { recommendations: [] },
        message: 'Agrega algunos mangas a favoritos para recibir recomendaciones'
      });
    }

    // Extraer géneros y autores más frecuentes
    const genreCount = {};
    const authorCount = {};

    userFavorites.forEach(fav => {
      fav.manga.genres.forEach(genre => {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });
      
      const author = fav.manga.author;
      if (author) {
        authorCount[author] = (authorCount[author] || 0) + 1;
      }
    });

    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre);

    const topAuthors = Object.entries(authorCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([author]) => author);

    // IDs de mangas ya en favoritos
    const favoriteIds = userFavorites.map(fav => fav.mangaId);

    // Buscar recomendaciones
    const recommendations = await prisma.manga.findMany({
      where: {
        AND: [
          { id: { notIn: favoriteIds } },
          {
            OR: [
              { genres: { hasSome: topGenres } },
              { author: { in: topAuthors } }
            ]
          }
        ]
      },
      orderBy: [
        { rating: 'desc' },
        { favoriteCount: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        title: true,
        cover: true,
        author: true,
        rating: true,
        year: true,
        genres: true,
        synopsis: true,
        favoriteCount: true
      }
    });

    // Calcular score de relevancia
    const recommendationsWithScore = recommendations.map(manga => {
      let score = 0;
      
      // Puntos por géneros coincidentes
      manga.genres.forEach(genre => {
        if (topGenres.includes(genre)) {
          score += genreCount[genre] || 0;
        }
      });
      
      // Puntos por autor coincidente
      if (topAuthors.includes(manga.author)) {
        score += authorCount[manga.author] * 2;
      }
      
      // Puntos por rating
      score += manga.rating * 0.5;
      
      return { ...manga, relevanceScore: score };
    });

    // Ordenar por score de relevancia
    recommendationsWithScore.sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.json({
      success: true,
      data: {
        recommendations: recommendationsWithScore,
        basedOn: {
          topGenres,
          topAuthors,
          totalFavorites: userFavorites.length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/favorites/import - Importar lista de favoritos
router.post('/import', requireAuth, async (req, res) => {
  try {
    const { mangaIds, defaultStatus = 'reading' } = req.body;

    if (!Array.isArray(mangaIds) || mangaIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Lista de IDs de manga requerida'
      });
    }

    if (mangaIds.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Máximo 100 mangas por importación'
      });
    }

    // Verificar que los mangas existen
    const existingMangas = await prisma.manga.findMany({
      where: { id: { in: mangaIds.map(id => parseInt(id)) } },
      select: { id: true, title: true }
    });

    if (existingMangas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Ningún manga válido encontrado'
      });
    }

    // Verificar cuáles ya están en favoritos
    const existingFavorites = await prisma.favorite.findMany({
      where: {
        userId: req.user.id,
        mangaId: { in: existingMangas.map(m => m.id) }
      },
      select: { mangaId: true }
    });

    const existingFavoriteIds = existingFavorites.map(f => f.mangaId);
    const newMangaIds = existingMangas
      .filter(m => !existingFavoriteIds.includes(m.id))
      .map(m => m.id);

    if (newMangaIds.length === 0) {
      return res.json({
        success: true,
        data: { added: 0, skipped: existingFavorites.length },
        message: 'Todos los mangas ya estaban en favoritos'
      });
    }

    // Crear favoritos en lote
    const favoritesToCreate = newMangaIds.map(mangaId => ({
      userId: req.user.id,
      mangaId,
      status: defaultStatus
    }));

    await prisma.favorite.createMany({
      data: favoritesToCreate
    });

    // Crear entradas de progreso de lectura
    const progressToCreate = newMangaIds.map(mangaId => ({
      userId: req.user.id,
      mangaId,
      status: defaultStatus,
      lastChapterRead: 0,
      pageNumber: 1
    }));

    await prisma.readingProgress.createMany({
      data: progressToCreate,
      skipDuplicates: true
    });

    // Incrementar contadores de favoritos
    await prisma.manga.updateMany({
      where: { id: { in: newMangaIds } },
      data: { favoriteCount: { increment: 1 } }
    });

    // Otorgar XP
    await prisma.user.update({
      where: { id: req.user.id },
      data: { experience: { increment: newMangaIds.length * 2 } }
    });

    res.json({
      success: true,
      data: {
        added: newMangaIds.length,
        skipped: existingFavorites.length,
        invalid: mangaIds.length - existingMangas.length
      },
      message: `${newMangaIds.length} mangas agregados a favoritos`
    });

  } catch (error) {
    console.error('Error importing favorites:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Funciones helper
async function getFavoritesByStatus(userId) {
  const statusCounts = await prisma.favorite.groupBy({
    by: ['status'],
    where: { userId },
    _count: true
  });

  return statusCounts.reduce((acc, item) => {
    acc[item.status] = item._count;
    return acc;
  }, {});
}

async function getFavoritesByType(userId) {
  const typeCounts = await prisma.favorite.groupBy({
    by: ['manga'],
    where: { userId },
    _count: true
  });

  // Esto requeriría una consulta más compleja para obtener tipos de manga
  // Por ahora retornamos un mock
  return {
    manga: 80,
    manhwa: 15,
    manhua: 5
  };
}

async function getFavoritesByGenre(userId) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      manga: { select: { genres: true } }
    }
  });

  const genreCount = {};
  favorites.forEach(fav => {
    fav.manga.genres.forEach(genre => {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });
  });

  return Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .reduce((acc, [genre, count]) => {
      acc[genre] = count;
      return acc;
    }, {});
}

module.exports = router;