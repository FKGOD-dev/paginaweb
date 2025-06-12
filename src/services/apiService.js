// src/services/apiService.js
class APIService {
  constructor(baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api') {
    this.baseURL = baseURL;
    this.jikanURL = 'https://api.jikan.moe/v4';
  }

  // Configuración de request con auth
  async request(endpoint, options = {}) {
    const { token } = useAuthStore.getState();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // === ANIME & MANGA ===
  async getAnimeDetails(id) {
    try {
      // Intentar nuestra API primero, fallback a Jikan
      return await this.request(`/anime/${id}`);
    } catch (error) {
      // Fallback a Jikan API
      const response = await fetch(`${this.jikanURL}/anime/${id}`);
      const data = await response.json();
      return data.data;
    }
  }

  async searchAnime(query, filters = {}) {
    const params = new URLSearchParams({
      q: query,
      ...filters
    });
    
    try {
      return await this.request(`/anime/search?${params}`);
    } catch (error) {
      // Fallback a Jikan
      const response = await fetch(`${this.jikanURL}/anime?${params}`);
      return await response.json();
    }
  }

  async getMangaDetails(id) {
    try {
      return await this.request(`/manga/${id}`);
    } catch (error) {
      const response = await fetch(`${this.jikanURL}/manga/${id}`);
      const data = await response.json();
      return data.data;
    }
  }

  // === USER CONTENT ===
  async getUserLists(userId) {
    return this.request(`/users/${userId}/lists`);
  }

  async createList(listData) {
    return this.request('/lists', {
      method: 'POST',
      body: JSON.stringify(listData)
    });
  }

  async updateList(listId, updates) {
    return this.request(`/lists/${listId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteList(listId) {
    return this.request(`/lists/${listId}`, {
      method: 'DELETE'
    });
  }

  // === COMMENTS & REVIEWS ===
  async getComments(contentType, contentId, page = 1) {
    return this.request(`/comments/${contentType}/${contentId}?page=${page}`);
  }

  async postComment(contentType, contentId, comment) {
    return this.request(`/comments/${contentType}/${contentId}`, {
      method: 'POST',
      body: JSON.stringify(comment)
    });
  }

  async getReviews(contentType, contentId) {
    return this.request(`/reviews/${contentType}/${contentId}`);
  }

  async postReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  // === GAMIFICATION ===
  async getUserStats(userId) {
    return this.request(`/users/${userId}/stats`);
  }

  async getUserAchievements(userId) {
    return this.request(`/users/${userId}/achievements`);
  }

  async getLeaderboard(type = 'xp', timeframe = 'all') {
    return this.request(`/leaderboard?type=${type}&timeframe=${timeframe}`);
  }

  async awardXP(action, amount) {
    return this.request('/xp/award', {
      method: 'POST',
      body: JSON.stringify({ action, amount })
    });
  }

  // === NOTIFICATIONS ===
  async getNotifications(page = 1) {
    return this.request(`/notifications?page=${page}`);
  }

  async markNotificationRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT'
    });
  }

  // === NOVELS ===
  async getUserNovels(userId) {
    return this.request(`/users/${userId}/novels`);
  }

  async createNovel(novelData) {
    return this.request('/novels', {
      method: 'POST',
      body: JSON.stringify(novelData)
    });
  }

  async updateNovel(novelId, updates) {
    return this.request(`/novels/${novelId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async getNovelChapters(novelId) {
    return this.request(`/novels/${novelId}/chapters`);
  }

  async createChapter(novelId, chapterData) {
    return this.request(`/novels/${novelId}/chapters`, {
      method: 'POST',
      body: JSON.stringify(chapterData)
    });
  }

  // === MANGA READER ===
  async getMangaChapter(mangaId, chapterNumber) {
    return this.request(`/manga/${mangaId}/chapters/${chapterNumber}`);
  }

  async getChapterPages(chapterId) {
    return this.request(`/chapters/${chapterId}/pages`);
  }

  async markChapterRead(chapterId, progress = 100) {
    return this.request(`/chapters/${chapterId}/read`, {
      method: 'POST',
      body: JSON.stringify({ progress })
    });
  }

  // === ANALYTICS ===
  async trackUserActivity(activity) {
    return this.request('/analytics/activity', {
      method: 'POST',
      body: JSON.stringify(activity)
    });
  }

  async getUserAnalytics(userId, timeframe = '30d') {
    return this.request(`/analytics/users/${userId}?timeframe=${timeframe}`);
  }
}

export const apiService = new APIService();

// Hook personalizado para usar el API service
export const useAPI = () => {
  return apiService;
};

// Hook para datos con cache y loading states
export const useAPIData = (endpoint, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiService.request(endpoint);
        
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error, refetch: () => fetchData() };
};