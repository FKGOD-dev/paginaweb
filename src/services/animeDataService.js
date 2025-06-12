// src/services/animeDataService.js
class AnimeDataService {
  constructor() {
    this.baseURL = 'https://api.jikan.moe/v4';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  // Cache helper
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Rate limiting helper
  async delay(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async apiRequest(endpoint, params = {}) {
    try {
      const url = new URL(`${this.baseURL}${endpoint}`);
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          url.searchParams.append(key, params[key]);
        }
      });

      const cacheKey = url.toString();
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      await this.delay(500); // Rate limiting
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('API Request error:', error);
      throw error;
    }
  }

  // Búsqueda de anime
  async searchAnime(query, filters = {}) {
    const params = {
      q: query,
      type: filters.type || undefined,
      status: filters.status || undefined,
      genres: filters.genres ? filters.genres.join(',') : undefined,
      order_by: filters.orderBy || 'score',
      sort: filters.sort || 'desc',
      limit: filters.limit || 25,
      page: filters.page || 1,
      min_score: filters.minScore || undefined,
      max_score: filters.maxScore || undefined,
      start_date: filters.startDate || undefined,
      end_date: filters.endDate || undefined
    };

    return await this.apiRequest('/anime', params);
  }

  // Búsqueda de manga
  async searchManga(query, filters = {}) {
    const params = {
      q: query,
      type: filters.type || undefined,
      status: filters.status || undefined,
      genres: filters.genres ? filters.genres.join(',') : undefined,
      order_by: filters.orderBy || 'score',
      sort: filters.sort || 'desc',
      limit: filters.limit || 25,
      page: filters.page || 1,
      min_score: filters.minScore || undefined,
      max_score: filters.maxScore || undefined,
      start_date: filters.startDate || undefined,
      end_date: filters.endDate || undefined
    };

    return await this.apiRequest('/manga', params);
  }

  // Anime por ID
  async getAnimeById(id) {
    return await this.apiRequest(`/anime/${id}`);
  }

  // Manga por ID
  async getMangaById(id) {
    return await this.apiRequest(`/manga/${id}`);
  }

  // Personajes de anime/manga
  async getCharacters(id, type = 'anime') {
    return await this.apiRequest(`/${type}/${id}/characters`);
  }

  // Staff de anime
  async getStaff(id) {
    return await this.apiRequest(`/anime/${id}/staff`);
  }

  // Estadísticas de anime/manga
  async getStatistics(id, type = 'anime') {
    return await this.apiRequest(`/${type}/${id}/statistics`);
  }

  // Recomendaciones
  async getRecommendations(id, type = 'anime') {
    return await this.apiRequest(`/${type}/${id}/recommendations`);
  }

  // Top anime/manga
  async getTopItems(type = 'anime', filters = {}) {
    const params = {
      type: filters.subtype || undefined,
      filter: filters.filter || 'bypopularity',
      limit: filters.limit || 25,
      page: filters.page || 1
    };

    return await this.apiRequest(`/top/${type}`, params);
  }

  // Anime de la temporada actual
  async getCurrentSeason() {
    return await this.apiRequest('/seasons/now');
  }

  // Próxima temporada
  async getUpcomingSeason() {
    return await this.apiRequest('/seasons/upcoming');
  }

  // Anime por temporada
  async getSeasonAnime(year, season) {
    return await this.apiRequest(`/seasons/${year}/${season}`);
  }

  // Géneros disponibles
  async getGenres(type = 'anime') {
    return await this.apiRequest(`/genres/${type}`);
  }

  // Búsqueda de personajes
  async searchCharacters(query, filters = {}) {
    const params = {
      q: query,
      limit: filters.limit || 25,
      page: filters.page || 1
    };

    return await this.apiRequest('/characters', params);
  }

  // Últimos capítulos de manga
  async getLatestChapters(limit = 8) {
    try {
      const data = await this.apiRequest('/manga', {
        order_by: 'published',
        sort: 'desc',
        limit,
        sfw: true
      });
      return data.data || [];
    } catch (error) {
      console.error('Error fetching latest chapters:', error);
      return [];
    }
  }

  // Datos para la homepage
  async getHomepageData() {
    try {
      const [
        topAnime,
        topManga,
        currentSeason,
        upcomingSeason,
        popularAnime
      ] = await Promise.all([
        this.getTopItems('anime', { filter: 'bypopularity', limit: 10 }),
        this.getTopItems('manga', { filter: 'bypopularity', limit: 10 }),
        this.getCurrentSeason(),
        this.getUpcomingSeason(),
        this.getTopItems('anime', { filter: 'airing', limit: 12 })
      ]);

      return {
        featured: currentSeason.data?.slice(0, 5) || [],
        topAnime: topAnime.data || [],
        topManga: topManga.data || [],
        currentSeason: currentSeason.data?.slice(0, 12) || [],
        upcoming: upcomingSeason.data?.slice(0, 8) || [],
        trending: popularAnime.data || []
      };
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      return {
        featured: [],
        topAnime: [],
        topManga: [],
        currentSeason: [],
        upcoming: [],
        trending: []
      };
    }
  }

  // Transformar datos para el formato de la aplicación
  transformAnimeData(animeData) {
    return {
      id: animeData.mal_id,
      title: animeData.title,
      titleEnglish: animeData.title_english,
      titleJapanese: animeData.title_japanese,
      type: animeData.type,
      source: animeData.source,
      episodes: animeData.episodes,
      status: animeData.status,
      aired: animeData.aired,
      duration: animeData.duration,
      rating: animeData.rating,
      score: animeData.score,
      scoredBy: animeData.scored_by,
      rank: animeData.rank,
      popularity: animeData.popularity,
      members: animeData.members,
      favorites: animeData.favorites,
      synopsis: animeData.synopsis,
      background: animeData.background,
      season: animeData.season,
      year: animeData.year,
      broadcast: animeData.broadcast,
      producers: animeData.producers,
      licensors: animeData.licensors,
      studios: animeData.studios,
      genres: animeData.genres,
      themes: animeData.themes,
      demographics: animeData.demographics,
      images: {
        jpg: animeData.images?.jpg || {},
        webp: animeData.images?.webp || {}
      },
      trailer: animeData.trailer,
      approved: animeData.approved,
      titles: animeData.titles
    };
  }

  transformMangaData(mangaData) {
    return {
      id: mangaData.mal_id,
      title: mangaData.title,
      titleEnglish: mangaData.title_english,
      titleJapanese: mangaData.title_japanese,
      type: mangaData.type,
      chapters: mangaData.chapters,
      volumes: mangaData.volumes,
      status: mangaData.status,
      publishing: mangaData.publishing,
      published: mangaData.published,
      score: mangaData.score,
      scoredBy: mangaData.scored_by,
      rank: mangaData.rank,
      popularity: mangaData.popularity,
      members: mangaData.members,
      favorites: mangaData.favorites,
      synopsis: mangaData.synopsis,
      background: mangaData.background,
      authors: mangaData.authors,
      serializations: mangaData.serializations,
      genres: mangaData.genres,
      themes: mangaData.themes,
      demographics: mangaData.demographics,
      images: {
        jpg: mangaData.images?.jpg || {},
        webp: mangaData.images?.webp || {}
      },
      approved: mangaData.approved,
      titles: mangaData.titles
    };
  }

  // Utilidades para formateo
  formatScore(score) {
    return score ? score.toFixed(2) : 'N/A';
  }

  formatMembers(members) {
    if (members >= 1000000) {
      return `${(members / 1000000).toFixed(1)}M`;
    } else if (members >= 1000) {
      return `${(members / 1000).toFixed(1)}K`;
    }
    return members?.toString() || '0';
  }

  formatDate(dateObj) {
    if (!dateObj || !dateObj.from) return 'Desconocido';
    const date = new Date(dateObj.from);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusColor(status) {
    const statusColors = {
      'Finished Airing': 'bg-green-500',
      'Currently Airing': 'bg-blue-500',
      'Not yet aired': 'bg-yellow-500',
      'Finished': 'bg-green-500',
      'Publishing': 'bg-blue-500',
      'On Hiatus': 'bg-orange-500',
      'Discontinued': 'bg-red-500'
    };
    return statusColors[status] || 'bg-gray-500';
  }

  getRatingColor(rating) {
    if (!rating) return 'text-gray-400';
    if (rating >= 9) return 'text-green-400';
    if (rating >= 8) return 'text-blue-400';
    if (rating >= 7) return 'text-yellow-400';
    if (rating >= 6) return 'text-orange-400';
    return 'text-red-400';
  }
}

// Exportar instancia singleton
export const animeDataService = new AnimeDataService();
export default animeDataService;