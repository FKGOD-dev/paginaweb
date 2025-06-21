const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const prisma = new PrismaClient();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/manga/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
    }
  }
});

// Middleware de autenticación (placeholder)
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }
  // Aquí iría la verificación JWT real
  req.user = { id: 1, role: 'user' }; // Mock user
  next();
};

const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    req.user = { id: 1, role: 'user' }; // Mock user
  }
  next();
};

// Middleware de admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador' });
  }
  next();
};

// GET /api/manga - Lista paginada de mangas
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const genre = req.query.genre || '';
    const status = req.query.status || '';
    const sort = req.query.sort || 'popularity'; // popularity, rating, latest, title
    const type = req.query.type || ''; // manga, anime, manhwa, manhua

    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { alternativeTitle: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (genre) {
      where.genres = { hasSome: [genre] };
    }
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }

    // Configurar ordenamiento
    let orderBy = {};
    switch (sort) {
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'latest':
        orderBy = { updatedAt: 'desc' };
        break;
      case 'title':
        orderBy = { title: 'asc' };
        break;
      case 'year':
        orderBy = { year: 'desc' };
        break;
      default: // popularity
        orderBy = { views: 'desc' };
    }

    // Consulta principal
    const [mangas, total] = await Promise.all([
      prisma.manga.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              chapters: true,
              favorites: true,
              reviews: true,
              comments: true
            }
          }
        }
      }),
      prisma.manga.count({ where })
    ]);

    // Si hay usuario autenticado, verificar favoritos
    let userFavorites = [];
    if (req.user) {
      const mangaIds = mangas.map(m => m.id);
      userFavorites = await prisma.favorite.findMany({
        where: {
          userId: req.user.id,
          mangaId: { in: mangaIds }
        },
        select: { mangaId: true, status: true }
      });
    }

    // Agregar información de favoritos
    const mangasWithFavorites = mangas.map(manga => {
      const userFavorite = userFavorites.find(fav => fav.mangaId === manga.id);
      return {
        ...manga,
        isFavorite: !!userFavorite,
        favoriteStatus: userFavorite?.status || null
      };
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        mangas: mangasWithFavorites,
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
    console.error('Error fetching mangas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});
router.get('/trending', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const period = req.query.period || 'week'; // day, week, month

    let dateFilter = new Date();
    switch (period) {
      case 'day':
        dateFilter.setDate(dateFilter.getDate() - 1);
        break;
      case 'month':
        dateFilter.setMonth(dateFilter.getMonth() - 1);
        break;
      default: // week
        dateFilter.setDate(dateFilter.getDate() - 7);
    }

    const trendingMangas = await prisma.manga.findMany({
      where: {
        updatedAt: {
          gte: dateFilter
        }
      },
      orderBy: [
        { views: 'desc' },
        { rating: 'desc' }
      ],
      take: limit,
      include: {
        _count: {
          select: {
            chapters: true,
            favorites: true,
            comments: true
          }
        }
      }
    });

    // Si hay usuario autenticado, verificar favoritos
    let userFavorites = [];
    if (req.user) {
      const mangaIds = trendingMangas.map(m => m.id);
      userFavorites = await prisma.favorite.findMany({
        where: {
          userId: req.user.id,
          mangaId: { in: mangaIds }
        },
        select: { mangaId: true, status: true }
      });
    }

    const mangasWithFavorites = trendingMangas.map(manga => {
      const userFavorite = userFavorites.find(fav => fav.mangaId === manga.id);
      return {
        ...manga,
        isFavorite: !!userFavorite,
        favoriteStatus: userFavorite?.status || null
      };
    });

    res.json({
      success: true,
      data: mangasWithFavorites,
      period
    });

  } catch (error) {
    console.error('Error fetching trending mangas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// GET /api/manga/:id - Manga individual
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const manga = await prisma.manga.findUnique({
      where: { id: parseInt(id) },
      include: {
        chapters: {
          orderBy: { number: 'desc' },
          take: 50 // Últimos 50 capítulos
        },
        reviews: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            chapters: true,
            favorites: true,
            reviews: true,
            comments: true
          }
        }
      }
    });

    if (!manga) {
      return res.status(404).json({ 
        success: false, 
        error: 'Manga no encontrado' 
      });
    }

    // Incrementar contador de vistas
    await prisma.manga.update({
      where: { id: parseInt(id) },
      data: { views: { increment: 1 } }
    });

    // Verificar si está en favoritos del usuario (si está autenticado)
    let isFavorite = false;
    let favoriteStatus = null;
    if (userId) {
      const favorite = await prisma.favorite.findFirst({
        where: {
          userId: userId,
          mangaId: parseInt(id)
        }
      });
      isFavorite = !!favorite;
      favoriteStatus = favorite?.status || null;
    }

    // Obtener mangas similares
    const similarMangas = await prisma.manga.findMany({
      where: {
        AND: [
          { id: { not: parseInt(id) } },
          {
            OR: [
              { genres: { hasSome: manga.genres } },
              { author: manga.author }
            ]
          }
        ]
      },
      take: 6,
      orderBy: { rating: 'desc' },
      select: {
        id: true,
        title: true,
        cover: true,
        coverImage: true,
        author: true,
        rating: true,
        type: true,
        genres: true
      }
    });

    res.json({
      success: true,
      data: {
        ...manga,
        isFavorite,
        favoriteStatus,
        similarMangas
      }
    });

  } catch (error) {
    console.error('Error fetching manga details:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});
// POST /api/manga - Crear nuevo manga (solo admin)
router.post('/', requireAuth, requireAdmin, upload.single('cover'), async (req, res) => {
  try {
    const {
      title,
      alternativeTitle,
      author,
      artist,
      synopsis,
      genres,
      year,
      status,
      type,
      rating
    } = req.body;

    // Validación básica
    if (!title || !author || !synopsis) {
      return res.status(400).json({ 
        success: false, 
        error: 'Campos requeridos: title, author, synopsis' 
      });
    }

    const coverPath = req.file ? `/uploads/manga/${req.file.filename}` : null;

    const manga = await prisma.manga.create({
      data: {
        title,
        alternativeTitle: alternativeTitle || '',
        author,
        artist: artist || author,
        synopsis,
        cover: coverPath,
        coverImage: coverPath,
        genres: Array.isArray(genres) ? genres : JSON.parse(genres || '[]'),
        year: parseInt(year) || new Date().getFullYear(),
        status: status || 'ongoing',
        type: type || 'manga',
        rating: parseFloat(rating) || 0,
        views: 0
      }
    });

    res.status(201).json({
      success: true,
      data: manga,
      message: 'Manga creado exitosamente'
    });

  } catch (error) {
    console.error('Error creating manga:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// PUT /api/manga/:id - Actualizar manga (solo admin)
router.put('/:id', requireAuth, requireAdmin, upload.single('cover'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      alternativeTitle,
      author,
      artist,
      synopsis,
      genres,
      year,
      status,
      type,
      rating
    } = req.body;

    const existingManga = await prisma.manga.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingManga) {
      return res.status(404).json({ 
        success: false, 
        error: 'Manga no encontrado' 
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (alternativeTitle !== undefined) updateData.alternativeTitle = alternativeTitle;
    if (author) updateData.author = author;
    if (artist) updateData.artist = artist;
    if (synopsis) updateData.synopsis = synopsis;
    if (genres) updateData.genres = Array.isArray(genres) ? genres : JSON.parse(genres);
    if (year) updateData.year = parseInt(year);
    if (status) updateData.status = status;
    if (type) updateData.type = type;
    if (rating !== undefined) updateData.rating = parseFloat(rating);

    if (req.file) {
      updateData.cover = `/uploads/manga/${req.file.filename}`;
      updateData.coverImage = `/uploads/manga/${req.file.filename}`;
    }

    const updatedManga = await prisma.manga.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedManga,
      message: 'Manga actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error updating manga:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// DELETE /api/manga/:id - Eliminar manga (solo admin)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const manga = await prisma.manga.findUnique({
      where: { id: parseInt(id) }
    });

    if (!manga) {
      return res.status(404).json({ 
        success: false, 
        error: 'Manga no encontrado' 
      });
    }

    // Eliminar en cascada (chapters, reviews, favorites, etc.)
    await prisma.manga.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Manga eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error deleting manga:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// POST /api/manga/:id/favorite - Agregar/quitar de favoritos
router.post('/:id/favorite', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'reading' } = req.body;
    const userId = req.user.id;

    const manga = await prisma.manga.findUnique({
      where: { id: parseInt(id) }
    });

    if (!manga) {
      return res.status(404).json({ 
        success: false, 
        error: 'Manga no encontrado' 
      });
    }

    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: userId,
        mangaId: parseInt(id)
      }
    });

    if (existingFavorite) {
      // Quitar de favoritos
      await prisma.favorite.delete({
        where: { id: existingFavorite.id }
      });

      // Decrementar contador
      await prisma.manga.update({
        where: { id: parseInt(id) },
        data: { favoriteCount: { decrement: 1 } }
      });

      res.json({
        success: true,
        isFavorite: false,
        message: 'Manga removido de favoritos'
      });
    } else {
      // Agregar a favoritos
      await prisma.favorite.create({
        data: {
          userId: userId,
          mangaId: parseInt(id),
          status: status
        }
      });

      // Incrementar contador
      await prisma.manga.update({
        where: { id: parseInt(id) },
        data: { favoriteCount: { increment: 1 } }
      });

      res.json({
        success: true,
        isFavorite: true,
        favoriteStatus: status,
        message: 'Manga agregado a favoritos'
      });
    }

  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// GET /api/manga/:id/chapters - Obtener capítulos de un manga
router.get('/:id/chapters', async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [chapters, total] = await Promise.all([
      prisma.chapter.findMany({
        where: { mangaId: parseInt(id) },
        orderBy: { number: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { comments: true }
          }
        }
      }),
      prisma.chapter.count({
        where: { mangaId: parseInt(id) }
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        chapters,
        pagination: {
          current: page,
          total: totalPages,
          limit,
          totalItems: total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// GET /api/manga/stats - Estadísticas generales
router.get('/stats', async (req, res) => {
  try {
    const [
      totalMangas,
      totalChapters,
      totalUsers,
      popularGenres
    ] = await Promise.all([
      prisma.manga.count(),
      prisma.chapter.count(),
      prisma.user.count(),
      prisma.manga.groupBy({
        by: ['genres'],
        _count: true,
        orderBy: {
          _count: {
            genres: 'desc'
          }
        },
        take: 10
      })
    ]);

    res.json({
      success: true,
      data: {
        totalMangas,
        totalChapters,
        totalUsers,
        popularGenres
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

module.exports = router;