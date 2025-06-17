const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// Middleware de autenticación opcional
const optionalAuth = (req, res, next) => {
  req.user = { id: 1, username: 'TestUser', role: 'user' };
  next();
};

// Cache simple para búsquedas populares
const searchCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Función para limpiar caché expirado
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of searchCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      searchCache.delete(key);
    }
  }
};

// GET /api/search/global - Búsqueda global (manga, usuarios, listas)
router.get('/global', optionalAuth, async (req, res) => {
  try {
    const { 
      q: query = '', 
      type = 'all', // all, manga, users, lists
      page = 1, 
      limit = 20 
    } = req.query;

    if (query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'La consulta debe tener al menos 2 caracteres'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const results = {};

    // Búsqueda de manga
    if (type === 'all' || type === 'manga') {
      const [mangas, mangaTotal] = await Promise.all([
        prisma.manga.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { alternativeTitle: { contains: query, mode: 'insensitive' } },
              { author: { contains: query, mode: 'insensitive' } },
              { synopsis: { contains: query, mode: 'insensitive' } }
            ]
          },
          orderBy: [
            { favoriteCount: 'desc' },
            { rating: 'desc' },
            { views: 'desc' }
          ],
          skip: type === 'manga' ? skip : 0,
          take: type === 'manga' ? parseInt(limit) : 5,
          select: {
            id: true,
            title: true,
            cover: true,
            author: true,
            rating: true,
            year: true,
            type: true,
            genres: true,
            status: true,
            favoriteCount: true,
            views: true
          }
        }),
        prisma.manga.count({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { alternativeTitle: { contains: query, mode: 'insensitive' } },
              { author: { contains: query, mode: 'insensitive' } },
              { synopsis: { contains: query, mode: 'insensitive' } }
            ]
          }
        })
      ]);

      results.manga = {
        items: mangas,
        total: mangaTotal,
        hasMore: mangaTotal > (type === 'manga' ? skip + mangas.length : 5)
      };
    }

    // Búsqueda de usuarios
    if (type === 'all' || type === 'users') {
      const [users, usersTotal] = await Promise.all([
        prisma.user.findMany({
          where: {
            AND: [
              {
                OR: [
                  { username: { contains: query, mode: 'insensitive' } },
                  { bio: { contains: query, mode: 'insensitive' } }
                ]
              },
              { isActive: true },
              { isProfilePublic: true }
            ]
          },
          orderBy: [
            { level: 'desc' },
            { experience: 'desc' }
          ],
          skip: type === 'users' ? skip : 0,
          take: type === 'users' ? parseInt(limit) : 3,
          select: {
            id: true,
            username: true,
            bio: true,
            avatar: true,
            level: true,
            experience: true,
            createdAt: true,
            _count: {
              select: {
                favorites: true,
                comments: true,
                reviews: true
              }
            }
          }
        }),
        prisma.user.count({
          where: {
            AND: [
              {
                OR: [
                  { username: { contains: query, mode: 'insensitive' } },
                  { bio: { contains: query, mode: 'insensitive' } }
                ]
              },
              { isActive: true },
              { isProfilePublic: true }
            ]
          }
        })
      ]);

      results.users = {
        items: users,
        total: usersTotal,
        hasMore: usersTotal > (type === 'users' ? skip + users.length : 3)
      };
    }

    // Búsqueda de listas
    if (type === 'all' || type === 'lists') {
      const [lists, listsTotal] = await Promise.all([
        prisma.userList.findMany({
          where: {
            AND: [
              {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { description: { contains: query, mode: 'insensitive' } }
                ]
              },
              { isPublic: true }
            ]
          },
          orderBy: [
            { likes: 'desc' },
            { views: 'desc' }
          ],
          skip: type === 'lists' ? skip : 0,
          take: type === 'lists' ? parseInt(limit) : 3,
          include: {
            user: {
              select: { id: true, username: true, avatar: true }
            },
            items: {
              include: {
                manga: {
                  select: { id: true, title: true, cover: true }
                }
              },
              take: 3
            },
            _count: {
              select: { items: true, likes: true }
            }
          }
        }),
        prisma.userList.count({
          where: {
            AND: [
              {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { description: { contains: query, mode: 'insensitive' } }
                ]
              },
              { isPublic: true }
            ]
          }
        })
      ]);

      results.lists = {
        items: lists,
        total: listsTotal,
        hasMore: listsTotal > (type === 'lists' ? skip + lists.length : 3)
      };
    }

    // Guardar búsqueda para estadísticas
    await prisma.searchLog.create({
      data: {
        query: query.trim(),
        type,
        userId: req.user?.id,
        resultsCount: Object.values(results).reduce((sum, cat) => sum + cat.total, 0),
        ipAddress: req.ip
      }
    }).catch(err => console.error('Error logging search:', err));

    res.json({
      success: true,
      data: {
        query,
        type,
        results,
        totalResults: Object.values(results).reduce((sum, cat) => sum + cat.total, 0)
      }
    });

  } catch (error) {
    console.error('Error in global search:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/search/manga - Búsqueda avanzada de manga
router.get('/manga', optionalAuth, async (req, res) => {
  try {
    const {
      q: query = '',
      genres = '',
      excludeGenres = '',
      type = '', // manga, manhwa, manhua, anime
      status = '', // ongoing, completed, hiatus, cancelled
      year = '',
      yearFrom = '',
      yearTo = '',
      rating = '',
      ratingFrom = '',
      ratingTo = '',
      author = '',
      sort = 'relevance', // relevance, popularity, rating, latest, alphabetical, year
      page = 1,
      limit = 20
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Crear clave de caché
    const cacheKey = JSON.stringify({
      query, genres, excludeGenres, type, status, year, yearFrom, yearTo,
      rating, ratingFrom, ratingTo, author, sort, page, limit
    });

    // Verificar caché
    cleanExpiredCache();
    if (searchCache.has(cacheKey)) {
      const cached = searchCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return res.json({
          success: true,
          data: cached.data,
          cached: true
        });
      }
    }

    // Construir filtros WHERE
    const where = { AND: [] };

    // Filtro de texto
    if (query) {
      where.AND.push({
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { alternativeTitle: { contains: query, mode: 'insensitive' } },
          { author: { contains: query, mode: 'insensitive' } },
          { synopsis: { contains: query, mode: 'insensitive' } }
        ]
      });
    }

    // Filtros de géneros
    if (genres) {
      const genreList = genres.split(',').map(g => g.trim()).filter(Boolean);
      if (genreList.length > 0) {
        where.AND.push({ genres: { hasSome: genreList } });
      }
    }

    if (excludeGenres) {
      const excludeList = excludeGenres.split(',').map(g => g.trim()).filter(Boolean);
      if (excludeList.length > 0) {
        where.AND.push({ genres: { hasNone: excludeList } });
      }
    }

    // Filtro de tipo
    if (type) {
      where.AND.push({ type });
    }

    // Filtro de estado
    if (status) {
      where.AND.push({ status });
    }

    // Filtros de año
    if (year) {
      where.AND.push({ year: parseInt(year) });
    } else {
      if (yearFrom) {
        where.AND.push({ year: { gte: parseInt(yearFrom) } });
      }
      if (yearTo) {
        where.AND.push({ year: { lte: parseInt(yearTo) } });
      }
    }

    // Filtros de rating
    if (rating) {
      where.AND.push({ rating: parseFloat(rating) });
    } else {
      if (ratingFrom) {
        where.AND.push({ rating: { gte: parseFloat(ratingFrom) } });
      }
      if (ratingTo) {
        where.AND.push({ rating: { lte: parseFloat(ratingTo) } });
      }
    }

    // Filtro de autor
    if (author) {
      where.AND.push({ author: { contains: author, mode: 'insensitive' } });
    }

    // Si no hay filtros, remover el AND vacío
    if (where.AND.length === 0) {
      delete where.AND;
    }

    // Configurar ordenamiento
    let orderBy = [];
    switch (sort) {
      case 'popularity':
        orderBy = [{ favoriteCount: 'desc' }, { views: 'desc' }];
        break;
      case 'rating':
        orderBy = [{ rating: 'desc' }, { favoriteCount: 'desc' }];
        break;
      case 'latest':
        orderBy = [{ updatedAt: 'desc' }];
        break;
      case 'alphabetical':
        orderBy = [{ title: 'asc' }];
        break;
      case 'year':
        orderBy = [{ year: 'desc' }];
        break;
      default: // relevance
        if (query) {
          orderBy = [{ favoriteCount: 'desc' }, { rating: 'desc' }];
        } else {
          orderBy = [{ views: 'desc' }, { rating: 'desc' }];
        }
    }

    // Ejecutar búsqueda
    const [mangas, total] = await Promise.all([
      prisma.manga.findMany({
        where,
        orderBy,
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          title: true,
          alternativeTitle: true,
          cover: true,
          author: true,
          artist: true,
          rating: true,
          year: true,
          type: true,
          status: true,
          genres: true,
          synopsis: true,
          favoriteCount: true,
          views: true,
          totalChapters: true,
          updatedAt: true,
          _count: {
            select: {
              chapters: true,
              reviews: true
            }
          }
        }
      }),
      prisma.manga.count({ where })
    ]);

    // Agregar información de favoritos del usuario si está autenticado
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

    const mangasWithUserData = mangas.map(manga => {
      const userFav = userFavorites.find(fav => fav.mangaId === manga.id);
      return {
        ...manga,
        isFavorite: !!userFav,
        favoriteStatus: userFav?.status || null
      };
    });

    const totalPages = Math.ceil(total / parseInt(limit));

    const responseData = {
      mangas: mangasWithUserData,
      pagination: {
        current: parseInt(page),
        total: totalPages,
        limit: parseInt(limit),
        totalItems: total,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      filters: {
        query,
        genres: genres ? genres.split(',') : [],
        excludeGenres: excludeGenres ? excludeGenres.split(',') : [],
        type,
        status,
        year,
        yearFrom,
        yearTo,
        rating,
        ratingFrom,
        ratingTo,
        author,
        sort
      }
    };

    // Guardar en caché si hay resultados
    if (mangas.length > 0) {
      searchCache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now()
      });
    }

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error in manga search:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/search/suggestions - Sugerencias de búsqueda
router.get('/suggestions', async (req, res) => {
  try {
    const { q: query = '', type = 'all' } = req.query;

    if (query.length < 1) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    const suggestions = [];

    // Sugerencias de manga
    if (type === 'all' || type === 'manga') {
      const mangaSuggestions = await prisma.manga.findMany({
        where: {
          OR: [
            { title: { startsWith: query, mode: 'insensitive' } },
            { author: { startsWith: query, mode: 'insensitive' } }
          ]
        },
        orderBy: { favoriteCount: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          author: true,
          cover: true,
          type: true
        }
      });

      suggestions.push(...mangaSuggestions.map(manga => ({
        type: 'manga',
        id: manga.id,
        title: manga.title,
        subtitle: `por ${manga.author}`,
        image: manga.cover,
        category: manga.type
      })));
    }

    // Sugerencias de autores
    if (type === 'all' || type === 'author') {
      const authorSuggestions = await prisma.manga.groupBy({
        by: ['author'],
        where: {
          author: { startsWith: query, mode: 'insensitive' }
        },
        _count: { author: true },
        orderBy: { _count: { author: 'desc' } },
        take: 3
      });

      suggestions.push(...authorSuggestions.map(author => ({
        type: 'author',
        title: author.author,
        subtitle: `${author._count.author} obras`,
        category: 'Autor'
      })));
    }

    // Sugerencias de géneros
    if (type === 'all' || type === 'genre') {
      const allGenres = [
        'Acción', 'Aventura', 'Comedia', 'Drama', 'Romance', 'Fantasía',
        'Sci-Fi', 'Horror', 'Misterio', 'Deportes', 'Slice of Life',
        'Shounen', 'Shoujo', 'Seinen', 'Josei', 'Ecchi', 'Harem'
      ];

      const genreSuggestions = allGenres
        .filter(genre => genre.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3);

      suggestions.push(...genreSuggestions.map(genre => ({
        type: 'genre',
        title: genre,
        subtitle: 'Género',
        category: 'Categoría'
      })));
    }

    res.json({
      success: true,
      data: { suggestions: suggestions.slice(0, 10) }
    });

  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/search/trending - Búsquedas trending
router.get('/trending', async (req, res) => {
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

    const trendingSearches = await prisma.searchLog.groupBy({
      by: ['query'],
      where: {
        createdAt: { gte: dateFilter },
        query: { not: '' }
      },
      _count: { query: true },
      orderBy: { _count: { query: 'desc' } },
      take: limit
    });

    const trending = trendingSearches.map((search, index) => ({
      rank: index + 1,
      query: search.query,
      searchCount: search._count.query
    }));

    res.json({
      success: true,
      data: {
        trending,
        period,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching trending searches:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/search/popular-genres - Géneros populares
router.get('/popular-genres', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Obtener géneros más populares basado en favoritos
    const favorites = await prisma.favorite.findMany({
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

    const popularGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([genre, count], index) => ({
        rank: index + 1,
        name: genre,
        count,
        percentage: ((count / favorites.length) * 100).toFixed(1)
      }));

    res.json({
      success: true,
      data: {
        genres: popularGenres,
        totalSamples: favorites.length
      }
    });

  } catch (error) {
    console.error('Error fetching popular genres:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/search/save - Guardar búsqueda
router.post('/save', optionalAuth, async (req, res) => {
  try {
    const { query, filters = {}, name } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autenticación requerida'
      });
    }

    if (!query && Object.keys(filters).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Consulta o filtros requeridos'
      });
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: req.user.id,
        name: name || `Búsqueda ${new Date().toLocaleDateString()}`,
        query: query || '',
        filters: filters,
        searchCount: 0
      }
    });

    res.status(201).json({
      success: true,
      data: savedSearch,
      message: 'Búsqueda guardada exitosamente'
    });

  } catch (error) {
    console.error('Error saving search:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/search/saved - Búsquedas guardadas del usuario
router.get('/saved', optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autenticación requerida'
      });
    }

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      success: true,
      data: { savedSearches }
    });

  } catch (error) {
    console.error('Error fetching saved searches:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// DELETE /api/search/saved/:searchId - Eliminar búsqueda guardada
router.delete('/saved/:searchId', optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autenticación requerida'
      });
    }

    const { searchId } = req.params;

    const deletedSearch = await prisma.savedSearch.deleteMany({
      where: {
        id: parseInt(searchId),
        userId: req.user.id
      }
    });

    if (deletedSearch.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Búsqueda guardada no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Búsqueda eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error deleting saved search:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;