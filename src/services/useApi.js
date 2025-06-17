import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Hook personalizado para hacer requests a la API
export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('authToken');
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers
        };

        const response = await fetch(`${API_BASE_URL}${url}`, {
          ...options,
          headers
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result.data || result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, JSON.stringify(options)]);

  return { data, loading, error };
};

// Hook para hacer requests manuales
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeRequest = async (url, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      };

      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { makeRequest, loading, error };
};

// Servicios específicos de la API
export const apiService = {
  // Manga endpoints
  manga: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return fetch(`${API_BASE_URL}/manga?${queryString}`)
        .then(res => res.json());
    },
    
    getById: (id) => {
      return fetch(`${API_BASE_URL}/manga/${id}`)
        .then(res => res.json());
    },
    
    search: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return fetch(`${API_BASE_URL}/search/manga?${queryString}`)
        .then(res => res.json());
    },
    
    getTrending: (period = 'week') => {
      return fetch(`${API_BASE_URL}/manga/trending?period=${period}`)
        .then(res => res.json());
    }
  },

  // User endpoints
  user: {
    login: (credentials) => {
      return fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      }).then(res => res.json());
    },
    
    register: (userData) => {
      return fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      }).then(res => res.json());
    },
    
    getProfile: (token) => {
      return fetch(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json());
    }
  },

  // External APIs for real manga data
  external: {
    // Jikan API (MyAnimeList)
    jikan: {
      getTopManga: async (page = 1) => {
        const response = await fetch(`https://api.jikan.moe/v4/top/manga?page=${page}`);
        return response.json();
      },
      
      searchManga: async (query, page = 1) => {
        const response = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&page=${page}`);
        return response.json();
      },
      
      getMangaById: async (id) => {
        const response = await fetch(`https://api.jikan.moe/v4/manga/${id}`);
        return response.json();
      },
      
      getSeasonalAnime: async () => {
        const response = await fetch('https://api.jikan.moe/v4/seasons/now');
        return response.json();
      }
    },

    // AniList API
    anilist: {
      query: async (query, variables = {}) => {
        const response = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables
          })
        });
        return response.json();
      },
      
      getTrendingManga: async () => {
        const query = `
          query {
            Page(page: 1, perPage: 20) {
              media(type: MANGA, sort: TRENDING_DESC) {
                id
                title {
                  romaji
                  english
                  native
                }
                coverImage {
                  large
                  medium
                }
                bannerImage
                description
                averageScore
                genres
                status
                chapters
                startDate {
                  year
                }
                staff {
                  nodes {
                    name {
                      full
                    }
                  }
                }
              }
            }
          }
        `;
        return apiService.external.anilist.query(query);
      },
      
      searchManga: async (search) => {
        const query = `
          query ($search: String) {
            Page(page: 1, perPage: 20) {
              media(type: MANGA, search: $search) {
                id
                title {
                  romaji
                  english
                  native
                }
                coverImage {
                  large
                  medium
                }
                description
                averageScore
                genres
                status
                chapters
                startDate {
                  year
                }
              }
            }
          }
        `;
        return apiService.external.anilist.query(query, { search });
      }
    }
  }
};

// Utility functions
export const formatApiError = (error) => {
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.error) return error.error;
  return 'Ocurrió un error inesperado';
};

export const isAuthError = (error) => {
  return error?.status === 401 || error?.message?.includes('unauthorized');
};

// Authentication helpers
export const authHelpers = {
  setToken: (token) => {
    localStorage.setItem('authToken', token);
  },
  
  getToken: () => {
    return localStorage.getItem('authToken');
  },
  
  removeToken: () => {
    localStorage.removeItem('authToken');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  }
};

export default apiService;