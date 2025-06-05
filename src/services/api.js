export async function fetchFromAPI(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Error en la API');
  }
  return response.json();
}

export const jikanAPI = 'https://api.jikan.moe/v4';
export const anilistAPI = 'https://graphql.anilist.co';
export const mangadexAPI = 'https://api.mangadex.org';
