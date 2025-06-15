const { z } = require('zod');
const { Client } = require('@elastic/elasticsearch');

// Configurar Elasticsearch
const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  auth: process.env.ELASTICSEARCH_USERNAME ? {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD
  } : undefined
});

// Schemas de validación
const globalSearchSchema = z.object({
  query: z.string().min(1, 'Query requerido'),
  type: z.enum(['all', 'anime', 'manga', 'characters', 'users', 'light_novels']).default('all'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
  filters: z.object({
    genres: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 2).optional(),
    status: z.string().optional(),
    rating: z.object({
      min: z.number().min(0).max(10).optional(),
      max: z.number().min(0).max(10).optional()
    }).optional(),
    adult: z.boolean().optional()
  }).optional(),
  sortBy: z.enum(['relevance', 'popularity', 'rating', 'created', 'updated']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

const advancedSearchSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  genres: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  year: z.object({
    from: z.number().int().min(1900).optional(),
    to: z.number().int().max(new Date().getFullYear() + 2).optional()
  }).optional(),
  rating: z.object({
    min: z.number().min(0).max(10).optional(),
    max: z.number().min(0).max(10).optional()
  }).optional(),
  episodes: z.object({
    min: z.number().int().min(1).optional(),
    max: z.number().int().optional()
  }).optional(),
  duration: z.object({
    min: z.number().int().min(1).optional(),
    max: z.number().int().optional()
  }).optional(),
  adult: z.boolean().optional(),
  sortBy: z.enum(['relevance', 'popularity', 'rating', 'created', 'title']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20)
});

const suggestionsSchema = z.object({
  query: z.string().min(1, 'Query requerido'),
  type: z.enum(['all', 'anime', 'manga', 'characters']).default('all'),
  limit: z.number().int().min(1).max(10).default(5)
});

async function searchRoutes(fastify, options) {
  
  // Helper para verificar si Elasticsearch está disponible
  const isElasticsearchAvailable = async () => {
    try {
      await esClient.ping();
      return true;
    } catch (error) {
      fastify.log.warn('Elasticsearch no disponible, usando búsqueda por base de datos');
      return false;
    }
  };
  
  // Helper para indexar contenido en Elasticsearch
  const indexContent = async (type, id, data) => {
    try {
      await esClient.index({
        index: `manga_platform_${type}`,
        id,
        body: data
      });
    } catch (error) {
      fastify.log.error('Error indexando en Elasticsearch:', error);
    }
  };
  
  // Helper para búsqueda en Elasticsearch
  const searchElasticsearch = async (index, query, filters = {}, sort = {}, from = 0, size = 10) => {
    try {
      const must = [];
      const filter = [];
      
      // Query principal
      if (query) {
        must.push({
          multi_match: {
            query,
            fields: [
              'title^3',
              'titleEnglish^2',
              'titleRomaji^2',
              'titleJapanese^2',
              'synopsis',
              'description',
              'genres^1.5',
              'tags'
            ],
            type: 'best_fields',
            fuzziness: 'AUTO'
          }
        });
      }
      
      // Filtros
      if (filters.genres && filters.genres.length > 0) {
        filter.push({
          terms: {
            'genres.keyword': filters.genres
          }
        });
      }
      
      if (filters.tags && filters.tags.length > 0) {
        filter.push({
          terms: {
            'tags.keyword': filters.tags
          }
        });
      }
      
      if (filters.year) {
        filter.push({
          range: {
            year: {
              gte: filters.year,
              lte: filters.year
            }
          }
        });
      }
      
      if (filters.status) {
        filter.push({
          term: {
            'status.keyword': filters.status
          }
        });
      }
      
      if (filters.rating) {
        const ratingFilter = { range: { rating: {} } };
        if (filters.rating.min !== undefined) ratingFilter.range.rating.gte = filters.rating.min;
        if (filters.rating.max !== undefined) ratingFilter.range.rating.lte = filters.rating.max;
        filter.push(ratingFilter);
      }
      
      if (filters.adult !== undefined) {
        filter.push({
          term: {
            adult: filters.adult
          }
        });
      }
      
      const searchBody = {
        query: {
          bool: {
            must: must.length > 0 ? must : [{ match_all: {} }],
            filter: filter.length > 0 ? filter : undefined
          }
        },
        from,
        size,
        highlight: {
          fields: {
            title: {},
            synopsis: {},
            description: {}
          }
        }
      };
      
      // Ordenamiento
      if (sort.field && sort.field !== 'relevance') {
        searchBody.sort = [{
          [sort.field]: {
            order: sort.order || 'desc'
          }
        }];
      }
      
      const response = await esClient.search({
        index,
        body: searchBody
      });
      
      return {
        hits: response.body.hits.hits,
        total: response.body.hits.total.value,
        aggregations: response.body.aggregations
      };
      
    } catch (error) {
      fastify.log.error('Error en búsqueda de Elasticsearch:', error);
      throw error;
    }
  };
  
  // Helper para búsqueda fallback en base de datos
  const searchDatabase = async (type, query, filters = {}, page = 1, limit = 10) => {
    const where = {};
    const skip = (page - 1) * limit;
    
    // Construir condiciones de búsqueda
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { titleEnglish: { contains: query, mode: 'insensitive' } },
        { titleRomaji: { contains: query, mode: 'insensitive' } },
        { synopsis: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }
    
    // Aplicar filtros
    if (filters.status) where.status = filters.status;
    if (filters.adult !== undefined) where.adult = filters.adult;
    if (filters.year) {
      where.startDate = {
        gte: new Date(`${filters.year}-01-01`),
        lt: new Date(`${filters.year + 1}-01-01`)
      };
    }
    
    if (filters.rating) {
      where.rating = {};
      if (filters.rating.min !== undefined) where.rating.gte = filters.rating.min;
      if (filters.rating.max !== undefined) where.rating.lte = filters.rating.max;
    }
    
    if (filters.genres && filters.genres.length > 0) {
      where.genres = {
        some: {
          genre: {
            name: {
              in: filters.genres
            }
          }
        }
      };
    }
    
    let results = [];
    let total = 0;
    
    if (type === 'anime' || type === 'all') {
      const [animes, animeCount] = await Promise.all([
        fastify.prisma.anime.findMany({
          where,
          skip: type === 'all' ? 0 : skip,
          take: type === 'all' ? 5 : limit,
          include: {
            genres: { include: { genre: true } },
            _count: { select: { favorites: true, reviews: true } }
          },
          orderBy: { popularity: 'desc' }
        }),
        fastify.prisma.anime.count({ where })
      ]);
      
      results.push(...animes.map(anime => ({
        type: 'anime',
        id: anime.id,
        title: anime.title,
        titleEnglish: anime.titleEnglish,
        synopsis: anime.synopsis,
        coverImage: anime.coverImage,
        rating: anime.rating,
        popularity: anime.popularity,
        genres: anime.genres.map(g => g.genre.name),
        stats: anime._count
      })));
      
      total += animeCount;
    }
    
    if (type === 'manga' || type === 'all') {
      const [mangas, mangaCount] = await Promise.all([
        fastify.prisma.manga.findMany({
          where,
          skip: type === 'all' ? 0 : skip,
          take: type === 'all' ? 5 : limit,
          include: {
            genres: { include: { genre: true } },
            _count: { select: { favorites: true, reviews: true } }
          },
          orderBy: { popularity: 'desc' }
        }),
        fastify.prisma.manga.count({ where })
      ]);
      
      results.push(...mangas.map(manga => ({
        type: 'manga',
        id: manga.id,
        title: manga.title,
        titleEnglish: manga.titleEnglish,
        synopsis: manga.synopsis,
        coverImage: manga.coverImage,
        rating: manga.rating,
        popularity: manga.popularity,
        genres: manga.genres.map(g => g.genre.name),
        stats: manga._count
      })));
      
      total += mangaCount;
    }
    
    return { results, total };
  };
  
  // 🔍 BÚSQUEDA GLOBAL
  fastify.get('/global', async (request, reply) => {
    try {
      const searchParams = globalSearchSchema.parse(request.query);
      const { query, type, page, limit, filters, sortBy, sortOrder } = searchParams;
      
      const isESAvailable = await isElasticsearchAvailable();
      let results = [];
      let total = 0;
      
      if (isESAvailable) {
        try {
          // Búsqueda con Elasticsearch
          const indices = type === 'all' 
            ? ['manga_platform_anime', 'manga_platform_manga', 'manga_platform_characters']
            : [`manga_platform_${type}`];
          
          let allResults = [];
          let totalHits = 0;
          
          for (const index of indices) {
            const searchResult = await searchElasticsearch(
              index,
              query,
              filters,
              { field: sortBy, order: sortOrder },
              (page - 1) * limit,
              type === 'all' ? Math.ceil(limit / indices.length) : limit
            );
            
            allResults.push(...searchResult.hits.map(hit => ({
              type: index.split('_').pop(),
              score: hit._score,
              ...hit._source,
              highlight: hit.highlight
            })));
            
            totalHits += searchResult.total;
          }
          
          // Ordenar por relevancia si es búsqueda global
          if (type === 'all' && sortBy === 'relevance') {
            allResults.sort((a, b) => b.score - a.score);
          }
          
          results = allResults.slice(0, limit);
          total = totalHits;
          
        } catch (esError) {
          fastify.log.error('Error en Elasticsearch, usando fallback:', esError);
          // Fallback a base de datos
          const dbResult = await searchDatabase(type, query, filters, page, limit);
          results = dbResult.results;
          total = dbResult.total;
        }
      } else {
        // Búsqueda directa en base de datos
        const dbResult = await searchDatabase(type, query, filters, page, limit);
        results = dbResult.results;
        total = dbResult.total;
      }
      
      reply.send({
        results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        searchParams: {
          query,
          type,
          filters,
          sortBy,
          sortOrder
        },
        searchMethod: isESAvailable ? 'elasticsearch' : 'database'
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Parámetros de búsqueda inválidos',
          details: error.errors
        });
      }
      throw error;
    }
  });
  
  // 🎯 BÚSQUEDA AVANZADA
  fastify.post('/advanced', async (request, reply) => {
    try {
      const searchParams = advancedSearchSchema.parse(request.body);
      const { page, limit, sortBy, sortOrder, ...filters } = searchParams;
      
      const isESAvailable = await isElasticsearchAvailable();
      
      if (isESAvailable) {
        try {
          // Construir query compleja para Elasticsearch
          const must = [];
          const filter = [];
          
          if (filters.title) {
            must.push({
              multi_match: {
                query: filters.title,
                fields: ['title^3', 'titleEnglish^2', 'titleRomaji^2', 'titleJapanese^2'],
                type: 'best_fields'
              }
            });
          }
          
          if (filters.description) {
            must.push({
              multi_match: {
                query: filters.description,
                fields: ['synopsis', 'description'],
                type: 'best_fields'
              }
            });
          }
          
          // Agregar filtros avanzados
          if (filters.type) {
            filter.push({ term: { 'type.keyword': filters.type } });
          }
          
          if (filters.status) {
            filter.push({ term: { 'status.keyword': filters.status } });
          }
          
          if (filters.year) {
            const yearFilter = { range: { year: {} } };
            if (filters.year.from) yearFilter.range.year.gte = filters.year.from;
            if (filters.year.to) yearFilter.range.year.lte = filters.year.to;
            filter.push(yearFilter);
          }
          
          if (filters.rating) {
            const ratingFilter = { range: { rating: {} } };
            if (filters.rating.min) ratingFilter.range.rating.gte = filters.rating.min;
            if (filters.rating.max) ratingFilter.range.rating.lte = filters.rating.max;
            filter.push(ratingFilter);
          }
          
          if (filters.episodes) {
            const episodesFilter = { range: { episodes: {} } };
            if (filters.episodes.min) episodesFilter.range.episodes.gte = filters.episodes.min;
            if (filters.episodes.max) episodesFilter.range.episodes.lte = filters.episodes.max;
            filter.push(episodesFilter);
          }
          
          if (filters.duration) {
            const durationFilter = { range: { duration: {} } };
            if (filters.duration.min) durationFilter.range.duration.gte = filters.duration.min;
            if (filters.duration.max) durationFilter.range.duration.lte = filters.duration.max;
            filter.push(durationFilter);
          }
          
          if (filters.genres && filters.genres.length > 0) {
            filter.push({ terms: { 'genres.keyword': filters.genres } });
          }
          
          if (filters.tags && filters.tags.length > 0) {
            filter.push({ terms: { 'tags.keyword': filters.tags } });
          }
          
          if (filters.adult !== undefined) {
            filter.push({ term: { adult: filters.adult } });
          }
          
          const searchResult = await esClient.search({
            index: 'manga_platform_*',
            body: {
              query: {
                bool: {
                  must: must.length > 0 ? must : [{ match_all: {} }],
                  filter: filter.length > 0 ? filter : undefined
                }
              },
              from: (page - 1) * limit,
              size: limit,
              sort: sortBy !== 'relevance' ? [{
                [sortBy]: { order: sortOrder }
              }] : undefined,
              aggs: {
                types: {
                  terms: { field: 'type.keyword' }
                },
                genres: {
                  terms: { field: 'genres.keyword', size: 20 }
                },
                years: {
                  terms: { field: 'year', size: 10 }
                },
                ratings: {
                  histogram: {
                    field: 'rating',
                    interval: 1,
                    min_doc_count: 1
                  }
                }
              }
            }
          });
          
          const results = searchResult.body.hits.hits.map(hit => ({
            type: hit._index.split('_').pop(),
            score: hit._score,
            ...hit._source
          }));
          
          reply.send({
            results,
            aggregations: searchResult.body.aggregations,
            pagination: {
              page,
              limit,
              total: searchResult.body.hits.total.value,
              totalPages: Math.ceil(searchResult.body.hits.total.value / limit)
            },
            searchMethod: 'elasticsearch'
          });
          
        } catch (esError) {
          fastify.log.error('Error en búsqueda avanzada de Elasticsearch:', esError);
          return reply.code(500).send({
            error: 'Error en búsqueda avanzada',
            message: 'Servicio de búsqueda temporalmente no disponible'
          });
        }
      } else {
        // Fallback simplificado para base de datos
        const dbFilters = {};
        
        if (filters.type) dbFilters.type = filters.type;
        if (filters.status) dbFilters.status = filters.status;
        if (filters.adult !== undefined) dbFilters.adult = filters.adult;
        
        const query = filters.title || filters.description || '';
        const dbResult = await searchDatabase('all', query, dbFilters, page, limit);
        
        reply.send({
          results: dbResult.results,
          pagination: {
            page,
            limit,
            total: dbResult.total,
            totalPages: Math.ceil(dbResult.total / limit)
          },
          searchMethod: 'database',
          note: 'Búsqueda avanzada limitada - Elasticsearch no disponible'
        });
      }
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Parámetros de búsqueda inválidos',
          details: error.errors
        });
      }
      throw error;
    }
  });
  
  // 💡 SUGERENCIAS DE BÚSQUEDA
  fastify.get('/suggestions', async (request, reply) => {
    try {
      const { query, type, limit } = suggestionsSchema.parse(request.query);
      
      const isESAvailable = await isElasticsearchAvailable();
      
      if (isESAvailable) {
        try {
          const indices = type === 'all' 
            ? ['manga_platform_anime', 'manga_platform_manga', 'manga_platform_characters']
            : [`manga_platform_${type}`];
          
          const suggestions = [];
          
          for (const index of indices) {
            const result = await esClient.search({
              index,
              body: {
                suggest: {
                  title_suggest: {
                    prefix: query,
                    completion: {
                      field: 'title_suggest',
                      size: limit
                    }
                  }
                },
                _source: ['title', 'titleEnglish', 'coverImage', 'type']
              }
            });
            
            const indexSuggestions = result.body.suggest.title_suggest[0].options.map(option => ({
              type: index.split('_').pop(),
              title: option._source.title,
              titleEnglish: option._source.titleEnglish,
              coverImage: option._source.coverImage,
              score: option._score
            }));
            
            suggestions.push(...indexSuggestions);
          }
          
          // Ordenar por score y limitar
          const sortedSuggestions = suggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
          
          reply.send({
            suggestions: sortedSuggestions,
            query,
            searchMethod: 'elasticsearch'
          });
          
        } catch (esError) {
          fastify.log.error('Error en sugerencias de Elasticsearch:', esError);
          // Fallback a base de datos
        }
      }
      
      // Fallback a búsqueda en base de datos
      const suggestions = [];
      
      if (type === 'anime' || type === 'all') {
        const animes = await fastify.prisma.anime.findMany({
          where: {
            OR: [
              { title: { startsWith: query, mode: 'insensitive' } },
              { titleEnglish: { startsWith: query, mode: 'insensitive' } }
            ]
          },
          select: {
            id: true,
            title: true,
            titleEnglish: true,
            coverImage: true,
            type: true
          },
          take: Math.ceil(limit / (type === 'all' ? 3 : 1)),
          orderBy: { popularity: 'desc' }
        });
        
        suggestions.push(...animes.map(anime => ({
          type: 'anime',
          id: anime.id,
          title: anime.title,
          titleEnglish: anime.titleEnglish,
          coverImage: anime.coverImage,
          mediaType: anime.type
        })));
      }
      
      if (type === 'manga' || type === 'all') {
        const mangas = await fastify.prisma.manga.findMany({
          where: {
            OR: [
              { title: { startsWith: query, mode: 'insensitive' } },
              { titleEnglish: { startsWith: query, mode: 'insensitive' } }
            ]
          },
          select: {
            id: true,
            title: true,
            titleEnglish: true,
            coverImage: true,
            type: true
          },
          take: Math.ceil(limit / (type === 'all' ? 3 : 1)),
          orderBy: { popularity: 'desc' }
        });
        
        suggestions.push(...mangas.map(manga => ({
          type: 'manga',
          id: manga.id,
          title: manga.title,
          titleEnglish: manga.titleEnglish,
          coverImage: manga.coverImage,
          mediaType: manga.type
        })));
      }
      
      if (type === 'characters' || type === 'all') {
        const characters = await fastify.prisma.character.findMany({
          where: {
            name: { startsWith: query, mode: 'insensitive' }
          },
          select: {
            id: true,
            name: true,
            image: true
          },
          take: Math.ceil(limit / (type === 'all' ? 3 : 1))
        });
        
        suggestions.push(...characters.map(character => ({
          type: 'character',
          id: character.id,
          title: character.name,
          coverImage: character.image
        })));
      }
      
      reply.send({
        suggestions: suggestions.slice(0, limit),
        query,
        searchMethod: 'database'
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
  
  // 📊 OBTENER FILTROS DISPONIBLES
  fastify.get('/filters', async (request, reply) => {
    try {
      const { type = 'all' } = request.query;
      
      // Obtener géneros
      const genres = await fastify.prisma.genre.findMany({
        select: {
          id: true,
          name: true,
          description: true
        },
        orderBy: { name: 'asc' }
      });
      
      // Obtener tags
      const tags = await fastify.prisma.tag.findMany({
        where: {
          adult: false // Solo tags no adultos por defecto
        },
        select: {
          id: true,
          name: true,
          description: true
        },
        orderBy: { name: 'asc' }
      });
      
      // Obtener rangos de años
      const yearRanges = await fastify.prisma.$queryRaw`
        SELECT 
          MIN(EXTRACT(YEAR FROM start_date)) as min_year,
          MAX(EXTRACT(YEAR FROM start_date)) as max_year
        FROM (
          SELECT start_date FROM animes WHERE start_date IS NOT NULL
          UNION ALL
          SELECT start_date FROM mangas WHERE start_date IS NOT NULL
        ) combined_dates
      `;
      
      const filters = {
        genres,
        tags,
        yearRange: {
          min: yearRanges[0]?.min_year || 1960,
          max: yearRanges[0]?.max_year || new Date().getFullYear()
        },
        types: {
          anime: ['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL', 'MUSIC'],
          manga: ['MANGA', 'MANHWA', 'MANHUA', 'NOVEL', 'ONE_SHOT', 'DOUJINSHI']
        },
        statuses: {
          anime: ['FINISHED', 'RELEASING', 'NOT_YET_RELEASED', 'CANCELLED'],
          manga: ['FINISHED', 'RELEASING', 'NOT_YET_RELEASED', 'CANCELLED', 'HIATUS']
        },
        ratingRange: {
          min: 0,
          max: 10,
          step: 0.1
        }
      };
      
      reply.send(filters);
      
    } catch (error) {
      throw error;
    }
  });
  
  // 🔥 BÚSQUEDAS POPULARES/TRENDING
  fastify.get('/trending', async (request, reply) => {
    try {
      const { period = '24h', limit = 10 } = request.query;
      
      // Esto normalmente se obtendría de un sistema de analytics
      // Por ahora, simulamos con datos populares
      
      let dateFilter = {};
      if (period === '24h') {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        dateFilter = { gte: oneDayAgo };
      } else if (period === '7d') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        dateFilter = { gte: oneWeekAgo };
      }
      
      // Obtener contenido trending basado en popularidad y comentarios recientes
      const [trendingAnimes, trendingMangas] = await Promise.all([
        fastify.prisma.anime.findMany({
          orderBy: [
            { trending: 'desc' },
            { popularity: 'desc' }
          ],
          take: Math.ceil(limit / 2),
          select: {
            id: true,
            title: true,
            titleEnglish: true,
            coverImage: true,
            trending: true,
            type: true
          }
        }),
        fastify.prisma.manga.findMany({
          orderBy: [
            { trending: 'desc' },
            { popularity: 'desc' }
          ],
          take: Math.ceil(limit / 2),
          select: {
            id: true,
            title: true,
            titleEnglish: true,
            coverImage: true,
            trending: true,
            type: true
          }
        })
      ]);
      
      // Simular términos de búsqueda populares
      const popularSearches = [
        'One Piece',
        'Attack on Titan',
        'Demon Slayer',
        'My Hero Academia',
        'Jujutsu Kaisen',
        'Chainsaw Man',
        'Spy x Family',
        'Tokyo Ghoul',
        'Death Note',
        'Naruto'
      ];
      
      const trendingContent = [
        ...trendingAnimes.map(anime => ({ ...anime, type: 'anime' })),
        ...trendingMangas.map(manga => ({ ...manga, type: 'manga' }))
      ].slice(0, limit);
      
      reply.send({
        trendingContent,
        popularSearches: popularSearches.slice(0, limit),
        period,
        generatedAt: new Date().toISOString()
      });
      
    } catch (error) {
      throw error;
    }
  });
  
  // 🔧 INDEXAR CONTENIDO (Solo admin)
  fastify.post('/index/:type/:id', async (request, reply) => {
    try {
      const { type, id } = request.params;
      const userRole = request.user?.role;
      
      if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
        return reply.code(403).send({ error: 'Permisos insuficientes' });
      }
      
      const isESAvailable = await isElasticsearchAvailable();
      if (!isESAvailable) {
        return reply.code(503).send({ error: 'Elasticsearch no disponible' });
      }
      
      let content = null;
      
      if (type === 'anime') {
        content = await fastify.prisma.anime.findUnique({
          where: { id },
          include: {
            genres: { include: { genre: true } },
            tags: { include: { tag: true } }
          }
        });
      } else if (type === 'manga') {
        content = await fastify.prisma.manga.findUnique({
          where: { id },
          include: {
            genres: { include: { genre: true } },
            tags: { include: { tag: true } }
          }
        });
      } else if (type === 'character') {
        content = await fastify.prisma.character.findUnique({
          where: { id }
        });
      }
      
      if (!content) {
        return reply.code(404).send({ error: 'Contenido no encontrado' });
      }
      
      // Preparar datos para indexación
      const indexData = {
        ...content,
        genres: content.genres?.map(g => g.genre.name) || [],
        tags: content.tags?.map(t => t.tag.name) || [],
        year: content.startDate ? new Date(content.startDate).getFullYear() : null,
        title_suggest: {
          input: [
            content.title,
            content.titleEnglish,
            content.titleRomaji,
            content.titleJapanese
          ].filter(Boolean)
        }
      };
      
      await indexContent(type, id, indexData);
      
      reply.send({
        message: `${type} indexado exitosamente`,
        id,
        type
      });
      
    } catch (error) {
      throw error;
    }
  });
}

module.exports = searchRoutes;