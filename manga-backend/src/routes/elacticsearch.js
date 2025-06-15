const { Client } = require('@elastic/elasticsearch');

// Configuración de Elasticsearch
const esConfig = {
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  auth: process.env.ELASTICSEARCH_USERNAME ? {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD
  } : undefined,
  requestTimeout: 60000,
  pingTimeout: 3000,
  sniffOnStart: true,
  sniffInterval: 300000,
  sniffOnConnectionFault: true,
  maxRetries: 3,
  retryDelay: 1000
};

// Crear cliente de Elasticsearch
const esClient = new Client(esConfig);

// Índices principales
const INDICES = {
  ANIME: 'manga_platform_anime',
  MANGA: 'manga_platform_manga', 
  CHARACTERS: 'manga_platform_characters',
  USERS: 'manga_platform_users',
  LIGHT_NOVELS: 'manga_platform_light_novels'
};

// Mappings para cada índice
const MAPPINGS = {
  anime: {
    properties: {
      id: { type: 'keyword' },
      title: { 
        type: 'text',
        analyzer: 'custom_analyzer',
        fields: {
          keyword: { type: 'keyword' },
          suggest: { type: 'completion' }
        }
      },
      titleEnglish: { 
        type: 'text',
        analyzer: 'english',
        fields: {
          keyword: { type: 'keyword' },
          suggest: { type: 'completion' }
        }
      },
      titleJapanese: { 
        type: 'text',
        analyzer: 'cjk',
        fields: {
          keyword: { type: 'keyword' }
        }
      },
      titleRomaji: { 
        type: 'text',
        analyzer: 'custom_analyzer',
        fields: {
          keyword: { type: 'keyword' }
        }
      },
      synopsis: { 
        type: 'text',
        analyzer: 'custom_analyzer'
      },
      description: { 
        type: 'text',
        analyzer: 'custom_analyzer'
      },
      type: { type: 'keyword' },
      status: { type: 'keyword' },
      source: { type: 'keyword' },
      episodes: { type: 'integer' },
      duration: { type: 'integer' },
      season: { type: 'keyword' },
      seasonYear: { type: 'integer' },
      startDate: { type: 'date' },
      endDate: { type: 'date' },
      airingAt: { type: 'date' },
      coverImage: { type: 'keyword' },
      bannerImage: { type: 'keyword' },
      trailer: { type: 'keyword' },
      rating: { type: 'float' },
      popularity: { type: 'integer' },
      trending: { type: 'float' },
      adult: { type: 'boolean' },
      malId: { type: 'integer' },
      anilistId: { type: 'integer' },
      genres: { 
        type: 'text',
        fields: {
          keyword: { type: 'keyword' }
        }
      },
      tags: { 
        type: 'text',
        fields: {
          keyword: { type: 'keyword' }
        }
      },
      year: { type: 'integer' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' }
    }
  },
  
  manga: {
    properties: {
      id: { type: 'keyword' },
      title: { 
        type: 'text',
        analyzer: 'custom_analyzer',
        fields: {
          keyword: { type: 'keyword' },
          suggest: { type: 'completion' }
        }
      },
      titleEnglish: { 
        type: 'text',
        analyzer: 'english',
        fields: {
          keyword: { type: 'keyword' },
          suggest: { type: 'completion' }
        }
      },
      titleJapanese: { 
        type: 'text',
        analyzer: 'cjk',
        fields: {
          keyword: { type: 'keyword' }
        }
      },
      titleRomaji: { 
        type: 'text',
        analyzer: 'custom_analyzer',
        fields: {
          keyword: { type: 'keyword' }
        }
      },
      synopsis: { 
        type: 'text',
        analyzer: 'custom_analyzer'
      },
      description: { 
        type: 'text',
        analyzer: 'custom_analyzer'
      },
      type: { type: 'keyword' },
      status: { type: 'keyword' },
      source: { type: 'keyword' },
      chapters: { type: 'integer' },
      volumes: { type: 'integer' },
      startDate: { type: 'date' },
      endDate: { type: 'date' },
      publishedAt: { type: 'date' },
      coverImage: { type: 'keyword' },
      bannerImage: { type: 'keyword' },
      rating: { type: 'float' },
      popularity: { type: 'integer' },
      trending: { type: 'float' },
      adult: { type: 'boolean' },
      malId: { type: 'integer' },
      anilistId: { type: 'integer' },
      genres: { 
        type: 'text',
        fields: {
          keyword: { type: 'keyword' }
        }
      },
      tags: { 
        type: 'text',
        fields: {
          keyword: { type: 'keyword' }
        }
      },
      year: { type: 'integer' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' }
    }
  },
  
  characters: {
    properties: {
      id: { type: 'keyword' },
      name: { 
        type: 'text',
        analyzer: 'custom_analyzer',
        fields: {
          keyword: { type: 'keyword' },
          suggest: { type: 'completion' }
        }
      },
      nameKanji: { 
        type: 'text',
        analyzer: 'cjk',
        fields: {
          keyword: { type: 'keyword' }
        }
      },
      nameAlternative: { 
        type: 'text',
        analyzer: 'custom_analyzer'
      },
      description: { 
        type: 'text',
        analyzer: 'custom_analyzer'
      },
      image: { type: 'keyword' },
      age: { type: 'keyword' },
      birthday: { type: 'keyword' },
      gender: { type: 'keyword' },
      malId: { type: 'integer' },
      anilistId: { type: 'integer' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' }
    }
  },
  
  users: {
    properties: {
      id: { type: 'keyword' },
      username: { 
        type: 'text',
        analyzer: 'keyword',
        fields: {
          suggest: { type: 'completion' }
        }
      },
      bio: { 
        type: 'text',
        analyzer: 'custom_analyzer'
      },
      level: { type: 'integer' },
      xp: { type: 'integer' },
      points: { type: 'integer' },
      streak: { type: 'integer' },
      country: { type: 'keyword' },
      isPublic: { type: 'boolean' },
      isActive: { type: 'boolean' },
      createdAt: { type: 'date' }
    }
  },
  
  lightNovels: {
    properties: {
      id: { type: 'keyword' },
      title: { 
        type: 'text',
        analyzer: 'custom_analyzer',
        fields: {
          keyword: { type: 'keyword' },
          suggest: { type: 'completion' }
        }
      },
      synopsis: { 
        type: 'text',
        analyzer: 'custom_analyzer'
      },
      content: { 
        type: 'text',
        analyzer: 'custom_analyzer'
      },
      status: { type: 'keyword' },
      views: { type: 'integer' },
      likes: { type: 'integer' },
      chapters: { type: 'integer' },
      isPublic: { type: 'boolean' },
      userId: { type: 'keyword' },
      author: { type: 'keyword' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
      publishedAt: { type: 'date' }
    }
  }
};

// Configuración de analizadores personalizados
const ANALYZERS = {
  settings: {
    analysis: {
      analyzer: {
        custom_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: [
            'lowercase',
            'asciifolding',
            'stop',
            'snowball',
            'custom_synonym'
          ]
        },
        autocomplete: {
          type: 'custom',
          tokenizer: 'autocomplete',
          filter: [
            'lowercase',
            'asciifolding'
          ]
        },
        search_autocomplete: {
          type: 'custom',
          tokenizer: 'keyword',
          filter: [
            'lowercase',
            'asciifolding'
          ]
        }
      },
      tokenizer: {
        autocomplete: {
          type: 'edge_ngram',
          min_gram: 2,
          max_gram: 20,
          token_chars: [
            'letter',
            'digit'
          ]
        }
      },
      filter: {
        custom_synonym: {
          type: 'synonym',
          synonyms: [
            'anime,animation',
            'manga,comic',
            'manhwa,webtoon',
            'shounen,shonen',
            'shoujo,shojo',
            'seinen,adult',
            'josei,ladies'
          ]
        }
      }
    }
  }
};

// Elasticsearch Manager
class ElasticsearchManager {
  constructor(client) {
    this.client = client;
  }
  
  // Verificar conexión
  async checkConnection() {
    try {
      const response = await this.client.ping();
      return { connected: true, response };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }
  
  // Crear índice con mapping
  async createIndex(indexName, mapping, settings = {}) {
    try {
      const exists = await this.client.indices.exists({ index: indexName });
      
      if (exists) {
        console.log(`Índice ${indexName} ya existe`);
        return false;
      }
      
      await this.client.indices.create({
        index: indexName,
        body: {
          settings: {
            ...ANALYZERS.settings,
            ...settings
          },
          mappings: mapping
        }
      });
      
      console.log(`✅ Índice ${indexName} creado`);
      return true;
    } catch (error) {
      console.error(`❌ Error creando índice ${indexName}:`, error.message);
      throw error;
    }
  }
  
  // Eliminar índice
  async deleteIndex(indexName) {
    try {
      const exists = await this.client.indices.exists({ index: indexName });
      
      if (!exists) {
        console.log(`Índice ${indexName} no existe`);
        return false;
      }
      
      await this.client.indices.delete({ index: indexName });
      console.log(`✅ Índice ${indexName} eliminado`);
      return true;
    } catch (error) {
      console.error(`❌ Error eliminando índice ${indexName}:`, error.message);
      throw error;
    }
  }
  
  // Indexar documento
  async indexDocument(indexName, id, document) {
    try {
      const response = await this.client.index({
        index: indexName,
        id,
        body: document,
        refresh: 'wait_for'
      });
      
      return response;
    } catch (error) {
      console.error(`❌ Error indexando documento en ${indexName}:`, error.message);
      throw error;
    }
  }
  
  // Indexar múltiples documentos (bulk)
  async bulkIndex(indexName, documents) {
    try {
      const body = [];
      
      documents.forEach(doc => {
        body.push({
          index: {
            _index: indexName,
            _id: doc.id
          }
        });
        body.push(doc);
      });
      
      const response = await this.client.bulk({
        body,
        refresh: 'wait_for'
      });
      
      if (response.errors) {
        const errors = response.items
          .filter(item => item.index && item.index.error)
          .map(item => item.index.error);
        
        console.error('Errores en bulk index:', errors);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error en bulk index:', error.message);
      throw error;
    }
  }
  
  // Búsqueda básica
  async search(indexName, query, options = {}) {
    try {
      const searchParams = {
        index: indexName,
        body: query,
        ...options
      };
      
      const response = await this.client.search(searchParams);
      return response;
    } catch (error) {
      console.error(`❌ Error en búsqueda de ${indexName}:`, error.message);
      throw error;
    }
  }
  
  // Búsqueda multi-match
  async multiSearch(query, indices = [], options = {}) {
    try {
      const searchQuery = {
        query: {
          multi_match: {
            query,
            fields: [
              'title^3',
              'titleEnglish^2', 
              'titleRomaji^2',
              'titleJapanese^1.5',
              'synopsis',
              'description',
              'name^3',
              'nameKanji^2'
            ],
            type: 'best_fields',
            fuzziness: 'AUTO',
            operator: 'or'
          }
        },
        highlight: {
          fields: {
            title: {},
            titleEnglish: {},
            synopsis: {},
            description: {},
            name: {}
          }
        },
        sort: [
          '_score',
          { popularity: { order: 'desc', missing: '_last' } },
          { rating: { order: 'desc', missing: '_last' } }
        ],
        ...options
      };
      
      const indexPattern = indices.length > 0 ? indices.join(',') : Object.values(INDICES).join(',');
      
      return await this.search(indexPattern, searchQuery, {
        size: options.size || 20,
        from: options.from || 0
      });
    } catch (error) {
      console.error('❌ Error en multi-search:', error.message);
      throw error;
    }
  }
  
  // Autocompletado
  async suggest(indexName, text, field = 'title.suggest', size = 5) {
    try {
      const response = await this.client.search({
        index: indexName,
        body: {
          suggest: {
            autocomplete: {
              prefix: text,
              completion: {
                field,
                size
              }
            }
          }
        }
      });
      
      return response.suggest.autocomplete[0].options;
    } catch (error) {
      console.error(`❌ Error en suggest de ${indexName}:`, error.message);
      throw error;
    }
  }
  
  // Agregaciones
  async aggregate(indexName, aggregations) {
    try {
      const response = await this.client.search({
        index: indexName,
        body: {
          size: 0,
          aggs: aggregations
        }
      });
      
      return response.aggregations;
    } catch (error) {
      console.error(`❌ Error en agregaciones de ${indexName}:`, error.message);
      throw error;
    }
  }
  
  // Eliminar documento
  async deleteDocument(indexName, id) {
    try {
      const response = await this.client.delete({
        index: indexName,
        id,
        refresh: 'wait_for'
      });
      
      return response;
    } catch (error) {
      console.error(`❌ Error eliminando documento de ${indexName}:`, error.message);
      throw error;
    }
  }
  
  // Actualizar documento
  async updateDocument(indexName, id, document) {
    try {
      const response = await this.client.update({
        index: indexName,
        id,
        body: {
          doc: document
        },
        refresh: 'wait_for'
      });
      
      return response;
    } catch (error) {
      console.error(`❌ Error actualizando documento de ${indexName}:`, error.message);
      throw error;
    }
  }
  
  // Estadísticas del índice
  async getIndexStats(indexName) {
    try {
      const stats = await this.client.indices.stats({ index: indexName });
      const health = await this.client.cluster.health({ index: indexName });
      
      return {
        docs: stats.indices[indexName].total.docs,
        size: stats.indices[indexName].total.store.size_in_bytes,
        health: health.status
      };
    } catch (error) {
      console.error(`❌ Error obteniendo stats de ${indexName}:`, error.message);
      throw error;
    }
  }
}

// Inicializar Elasticsearch
const esManager = new ElasticsearchManager(esClient);

// Función para configurar todos los índices
const initializeElasticsearch = async () => {
  console.log('🚀 Inicializando Elasticsearch...');
  
  try {
    // Verificar conexión
    const connection = await esManager.checkConnection();
    if (!connection.connected) {
      throw new Error(`No se puede conectar a Elasticsearch: ${connection.error}`);
    }
    
    // Crear índices con sus mappings
    await esManager.createIndex(INDICES.ANIME, MAPPINGS.anime);
    await esManager.createIndex(INDICES.MANGA, MAPPINGS.manga);
    await esManager.createIndex(INDICES.CHARACTERS, MAPPINGS.characters);
    await esManager.createIndex(INDICES.USERS, MAPPINGS.users);
    await esManager.createIndex(INDICES.LIGHT_NOVELS, MAPPINGS.lightNovels);
    
    console.log('✅ Elasticsearch inicializado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error inicializando Elasticsearch:', error.message);
    throw error;
  }
};

// Helper para indexar desde base de datos
const indexFromDatabase = async (prismaClient) => {
  console.log('📊 Indexando datos desde base de datos...');
  
  try {
    // Indexar animes
    const animes = await prismaClient.anime.findMany({
      include: {
        genres: { include: { genre: true } },
        tags: { include: { tag: true } }
      }
    });
    
    const animeDocuments = animes.map(anime => ({
      id: anime.id,
      ...anime,
      genres: anime.genres.map(g => g.genre.name),
      tags: anime.tags.map(t => t.tag.name),
      year: anime.startDate ? new Date(anime.startDate).getFullYear() : null
    }));
    
    if (animeDocuments.length > 0) {
      await esManager.bulkIndex(INDICES.ANIME, animeDocuments);
      console.log(`✅ ${animeDocuments.length} animes indexados`);
    }
    
    // Indexar mangas
    const mangas = await prismaClient.manga.findMany({
      include: {
        genres: { include: { genre: true } },
        tags: { include: { tag: true } }
      }
    });
    
    const mangaDocuments = mangas.map(manga => ({
      id: manga.id,
      ...manga,
      genres: manga.genres.map(g => g.genre.name),
      tags: manga.tags.map(t => t.tag.name),
      year: manga.startDate ? new Date(manga.startDate).getFullYear() : null
    }));
    
    if (mangaDocuments.length > 0) {
      await esManager.bulkIndex(INDICES.MANGA, mangaDocuments);
      console.log(`✅ ${mangaDocuments.length} mangas indexados`);
    }
    
    // Indexar personajes
    const characters = await prismaClient.character.findMany();
    if (characters.length > 0) {
      await esManager.bulkIndex(INDICES.CHARACTERS, characters);
      console.log(`✅ ${characters.length} personajes indexados`);
    }
    
    // Indexar usuarios públicos
    const users = await prismaClient.user.findMany({
      where: { isPublic: true, isActive: true },
      select: {
        id: true,
        username: true,
        bio: true,
        level: true,
        xp: true,
        points: true,
        streak: true,
        country: true,
        isPublic: true,
        isActive: true,
        createdAt: true
      }
    });
    
    if (users.length > 0) {
      await esManager.bulkIndex(INDICES.USERS, users);
      console.log(`✅ ${users.length} usuarios indexados`);
    }
    
    // Indexar novelas ligeras públicas
    const lightNovels = await prismaClient.lightNovel.findMany({
      where: { isPublic: true },
      include: {
        user: {
          select: { username: true }
        }
      }
    });
    
    const novelDocuments = lightNovels.map(novel => ({
      id: novel.id,
      ...novel,
      author: novel.user.username
    }));
    
    if (novelDocuments.length > 0) {
      await esManager.bulkIndex(INDICES.LIGHT_NOVELS, novelDocuments);
      console.log(`✅ ${novelDocuments.length} novelas ligeras indexadas`);
    }
    
    console.log('✅ Indexación completa');
  } catch (error) {
    console.error('❌ Error indexando desde base de datos:', error.message);
    throw error;
  }
};

module.exports = {
  esClient,
  esManager,
  INDICES,
  MAPPINGS,
  initializeElasticsearch,
  indexFromDatabase
};