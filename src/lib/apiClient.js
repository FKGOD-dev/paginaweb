const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  };
  const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export const getAnimeById = (id) => request(`/anime/${id}`);
export const searchManga = (query) => request(`/search?query=${encodeURIComponent(query)}`);

export default { request, getAnimeById, searchManga };
